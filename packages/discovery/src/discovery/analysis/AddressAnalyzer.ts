import { assert } from '@l2beat/backend-tools'
import {
  ContractParameters,
  ContractValue,
  UpgradeabilityParameters,
} from '@l2beat/discovery-types'
import { EthereumAddress, UnixTime } from '@l2beat/shared-pure'
import { isEqual } from 'lodash'

import { DiscoveryLogger } from '../DiscoveryLogger'
import { ContractOverrides } from '../config/DiscoveryOverrides'
import { HandlerExecutor } from '../handlers/HandlerExecutor'
import { DiscoveryProvider } from '../provider/DiscoveryProvider'
import { ProxyDetector } from '../proxies/ProxyDetector'
import {
  PerContractSource,
  SourceCodeService,
} from '../source/SourceCodeService'
import { TemplateService } from './TemplateService'
import { getRelativesWithSuggestedTemplates } from './getRelativesWithSuggestedTemplates'

export type Analysis = AnalyzedContract | AnalyzedEOA

export interface AnalyzedContract {
  type: 'Contract'
  address: EthereumAddress
  name: string
  deploymentTimestamp?: UnixTime
  deploymentBlockNumber?: number
  derivedName: string | undefined
  isVerified: boolean
  upgradeability: UpgradeabilityParameters
  implementations: EthereumAddress[]
  values: Record<string, ContractValue>
  errors: Record<string, string>
  abis: Record<string, string[]>
  sourceBundles: PerContractSource[]
  extendedTemplate?: ExtendedTemplate
  ignoreInWatchMode?: string[]
  relatives: AddressesWithTemplates
}

export interface ExtendedTemplate {
  template: string
  reason: 'byExtends' | 'byReferrer' | 'byShapeMatch'
}

export interface AnalyzedEOA {
  type: 'EOA'
  address: EthereumAddress
}

export type AddressesWithTemplates = Record<string, Set<string>>

export class AddressAnalyzer {
  constructor(
    private readonly provider: DiscoveryProvider,
    private readonly proxyDetector: ProxyDetector,
    private readonly sourceCodeService: SourceCodeService,
    private readonly handlerExecutor: HandlerExecutor,
    private readonly templateService: TemplateService,
    private readonly logger: DiscoveryLogger,
  ) {}

  async analyze(
    address: EthereumAddress,
    overrides: ContractOverrides | undefined,
    blockNumber: number,
    logger: DiscoveryLogger,
    suggestedTemplates?: Set<string>,
  ): Promise<Analysis> {
    const code = await this.provider.getCode(address, blockNumber)
    if (code.length === 0) {
      logger.logEoa()
      return { type: 'EOA', address }
    }

    const deployment = await this.provider.getDeploymentInfo(address)

    const templateErrors: Record<string, string> = {}
    let extendedTemplate: ExtendedTemplate | undefined = undefined

    if (overrides?.extends !== undefined) {
      extendedTemplate = { template: overrides.extends, reason: 'byExtends' }
    } else if (suggestedTemplates !== undefined) {
      const template = Array.from(suggestedTemplates)[0]
      if (template !== undefined) {
        // extend template even on error to make sure pruning works
        overrides = this.templateService.applyTemplateOnContractOverrides(
          overrides ?? { address },
          template,
        )
        extendedTemplate = { template, reason: 'byReferrer' }
      }
      if (suggestedTemplates.size > 1) {
        templateErrors['@template'] =
          `Multiple templates suggested (${Array.from(suggestedTemplates).join(
            ', ',
          )})`
      }
    }

    const proxy = await this.proxyDetector.detectProxy(
      address,
      blockNumber,
      logger,
      overrides?.proxyType,
    )

    const sources = await this.sourceCodeService.getSources(
      address,
      proxy?.implementations,
    )
    logger.logName(sources.name)

    // Match templates by shape only if there are no explicitly set
    if (
      overrides?.extends === undefined &&
      (suggestedTemplates === undefined || suggestedTemplates.size === 0)
    ) {
      const matchingTemplatesByShape =
        this.templateService.findMatchingTemplates(sources)
      const matchingTemplates = Object.keys(matchingTemplatesByShape)
      const template = matchingTemplates[0]
      if (template !== undefined) {
        // extend template even on error to make sure pruning works
        overrides = this.templateService.applyTemplateOnContractOverrides(
          overrides ?? { address },
          template,
        )
        extendedTemplate = { template, reason: 'byShapeMatch' }
      }
      if (matchingTemplates.length > 1) {
        templateErrors['@template'] =
          `Multiple shapes matched (${matchingTemplates.join(', ')})`
      }
    }

    const { results, values, errors } = await this.handlerExecutor.execute(
      address,
      sources.abi,
      overrides,
      blockNumber,
      logger,
    )

    return {
      type: 'Contract',
      name: overrides?.name ?? sources.name,
      derivedName: overrides?.name !== undefined ? sources.name : undefined,
      isVerified: sources.isVerified,
      address,
      deploymentTimestamp: deployment?.timestamp,
      deploymentBlockNumber: deployment?.blockNumber,
      upgradeability: proxy?.upgradeability ?? { type: 'immutable' },
      implementations: proxy?.implementations ?? [],
      values: values ?? {},
      errors: { ...templateErrors, ...(errors ?? {}) },
      abis: sources.abis,
      sourceBundles: sources.sources,
      extendedTemplate,
      ignoreInWatchMode: overrides?.ignoreInWatchMode,
      relatives: getRelativesWithSuggestedTemplates(
        results,
        overrides?.ignoreRelatives,
        proxy?.relatives,
        proxy?.implementations,
        overrides?.fields,
      ),
    }
  }

  async hasContractChanged(
    contract: ContractParameters,
    overrides: ContractOverrides,
    blockNumber: number,
    abis: Record<string, string[]>,
  ): Promise<boolean> {
    if (contract.unverified) {
      // Check if the contract is verified now
      const { isVerified } = await this.sourceCodeService.getSources(
        contract.address,
        contract.implementations,
      )
      return isVerified
    }

    const abi = this.sourceCodeService.getRelevantAbi(
      abis,
      contract.address,
      contract.implementations,
      contract.ignoreInWatchMode,
    )

    const { values: newValues, errors } = await this.handlerExecutor.execute(
      contract.address,
      abi,
      overrides,
      blockNumber,
      this.logger,
    )

    assert(
      errors === undefined || Object.keys(errors).length === 0,
      'Errors during watch mode',
    )

    const prevRelevantValues = getRelevantValues(
      contract.values ?? {},
      contract.ignoreInWatchMode ?? [],
    )

    if (!isEqual(newValues, prevRelevantValues)) {
      this.logger.log(
        `Some values changed on contract ${
          contract.name
        }(${contract.address.toString()})`,
      )
      return true
    }

    return false
  }

  async hasEoaBecomeContract(
    address: EthereumAddress,
    blockNumber: number,
  ): Promise<boolean> {
    const code = await this.provider.getCode(address, blockNumber)
    if (code.length > 0) {
      this.logger.log(`EOA ${address.toString()} became a contract`)
      return true
    }

    return false
  }
}

function getRelevantValues(
  contractValues: Record<string, ContractValue | undefined>,
  ignoreInWatchMode: string[],
): Record<string, ContractValue | undefined> {
  return Object.keys(contractValues)
    .filter((key) => !ignoreInWatchMode.includes(key))
    .reduce((obj: Record<string, ContractValue | undefined>, key: string) => {
      obj[key] = contractValues[key]
      return obj
    }, {})
}
