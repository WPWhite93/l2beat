import { EthereumAddress, UnixTime } from '@l2beat/shared-pure'

import { DERIVATION, MILESTONES, NUGGETS } from '../../common'
import { subtractOneAfterBlockInclusive } from '../../common/assessCount'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import { opStackL2 } from './templates/opStack'
import { Layer2 } from './types'
const discovery = new ProjectDiscovery('optimism')
const l2Discovery = new ProjectDiscovery('optimism', 'optimism')

const l1Upgradeability = {
  upgradableBy: ['ProxyAdmin'],
  upgradeDelay: 'No delay',
}

const l2Upgradability = {
  upgradableBy: ['L2ProxyAdmin'],
  upgradeDelay: 'No delay',
}

export const optimism: Layer2 = opStackL2({
  discovery,
  display: {
    name: 'OP Mainnet',
    slug: 'optimism',
    warning:
      'Fraud proof system is currently under development. Users need to trust block Proposer to submit correct L1 state roots.',
    description:
      'OP Mainnet is an EVM-equivalent Optimistic Rollup. It aims to be fast, simple, and secure.',
    purposes: ['Universal'],
    links: {
      websites: ['https://optimism.io/'],
      apps: [],
      documentation: ['https://community.optimism.io'],
      explorers: [
        'https://optimistic.etherscan.io',
        'https://optimism.blockscout.com/',
        'https://mainnet.superscan.network',
      ],
      repositories: ['https://github.com/ethereum-optimism/optimism'],
      socialMedia: [
        'https://optimism.mirror.xyz/',
        'https://twitter.com/OptimismFND',
        'https://twitter.com/OPLabsPBC',
        'https://youtube.com/playlist?list=PLX_rXoLYCf5HqTWygUfoMfzRirGz5lekH',
        'https://twitch.tv/optimismpbc',
      ],
      rollupCodes: 'https://rollup.codes/optimism',
    },
    activityDataSource: 'Blockchain RPC',
  },
  associatedTokens: ['OP'],
  upgradeability: l1Upgradeability,
  transactionApi: {
    type: 'rpc',
    defaultUrl: 'https://mainnet.optimism.io/',
    startBlock: 1,
    assessCount: subtractOneAfterBlockInclusive(105235064),
  },
  genesisTimestamp: new UnixTime(1686074603),
  finality: {
    type: 'OPStack-blob',
    // timestamp of the first blob tx
    minTimestamp: new UnixTime(1710375155),
    l2BlockTimeSeconds: 2,
    genesisTimestamp: new UnixTime(1686068903),
    lag: 0,
    stateUpdate: 'disabled',
  },
  stateDerivation: {
    ...DERIVATION.OPSTACK('OP_MAINNET'),
    genesisState:
      'Since OP Mainnet has migrated from the OVM to Bedrock, a node must be synced using a data directory that can be found [here](https://community.optimism.io/docs/useful-tools/networks/#links). To reproduce the migration itself, see this [guide](https://blog.oplabs.co/reproduce-bedrock-migration/).',
  },
  upgradesAndGovernance:
    'All contracts are upgradable by the `ProxyAdmin` which is controlled by a 2/2 multisig composed by the Optimism Foundation and a Security Council. Currently, the Guardian, the Proposer and the Challenger roles are assigned to single actors and an implementation upgrade is required to update them. \n\nThe `FoundationMultisig_2` controls both the Guardian and Challenger role. `FoundationMultisig_2` controls the `SuperchainConfig` Superchain-wide pause mechanism that can pause `L1CrossDomainMessenger` messages relay, as well as ERC-20 and ERC-721 withdrawals. The single Sequencer actor can be modified by the `FoundationMultisig_2` via the `SystemConfig` contract. \n\nAt the moment, for regular upgrades, the DAO signals its intent by voting on upgrade proposals, but has no direct control over the upgrade process.',
  isNodeAvailable: true,
  hasProperSecurityCouncil: false,
  milestones: [
    // {
    //   name: 'Optimism Protocol Upgrade #6: Multi-Chain Prep (MCP) L1',
    //   link: 'https://vote.optimism.io/proposals/47253113366919812831791422571513347073374828501432502648295761953879525315523',
    //   date: 'upcoming',
    //   description: 'Superchain enables L1 contracts to be upgraded atomically across multiple chains in a single transaction.',
    // },
    {
      name: 'OP Mainnet starts using blobs',
      link: 'https://twitter.com/Optimism/status/1768235284494450922',
      date: '2024-03-14T00:00:00Z',
      description: 'OP Mainnet starts publishing data to blobs.',
    },
    {
      name: 'Network Upgrade #5: Ecotone',
      link: 'https://vote.optimism.io/proposals/95119698597711750186734377984697814101707190887694311194110013874163880701970',
      date: '2024-03-14T00:00:00Z',
      description: 'Optimism adopts EIP-4844.',
    },
    {
      name: 'Fault Proof System is live on OP Goerli',
      link: 'https://blog.oplabs.co/op-stack-fault-proof-alpha/',
      date: '2023-10-03T00:00:00Z',
      description: 'Fraud Proof system is live on Goerli.',
    },
    {
      name: 'Mainnet migration to Bedrock',
      link: 'https://oplabs.notion.site/Bedrock-Mission-Control-EXTERNAL-fca344b1f799447cb1bcf3aae62157c5',
      date: '2023-06-06T00:00:00Z',
      description: 'OP Mainnet, since Jun 2023 is running Bedrock.',
    },
    {
      name: 'OP Stack Introduced',
      link: 'https://optimism.mirror.xyz/fLk5UGjZDiXFuvQh6R_HscMQuuY9ABYNF7PI76-qJYs',
      date: '2022-10-17T00:00:00Z',
      description:
        'OP Stack, modular, open-sourced blueprint on how to build scalable blockchains.',
    },
    {
      ...MILESTONES.MAINNET_OPEN,
      link: 'https://medium.com/ethereum-optimism/all-gas-no-brakes-8b0f32afd466',
      date: '2021-12-16T00:00:00Z',
      description:
        'Whitelist got removed, there are no restrictions on who can transact with the network.',
    },
    {
      name: 'OP token airdrop',
      link: 'https://optimism.mirror.xyz/qvd0WfuLKnePm1Gxb9dpGchPf5uDz5NSMEFdgirDS4c',
      date: '2022-05-31T00:00:00Z',
      description: 'The first round of OP token airdrop.',
    },
    {
      name: 'OVM 2.0 is live',
      link: 'https://twitter.com/optimismfnd/status/1458953238867165192?s=21&t=cQ0NPREYt-u1rP7OiPFKUg',
      date: '2021-11-12T00:00:00Z',
      description:
        'Network upgrade to OVM 2.0 and removal of fraud-proof system.',
    },
    {
      name: 'Mainnet Soft Launch',
      link: 'https://medium.com/ethereum-optimism/mainnet-soft-launch-7cacc0143cd5',
      date: '2021-01-16T00:00:00Z',
      description:
        'Only selected contracts like Synthetix and Uniswap are available.',
    },
    {
      name: 'Community Launch',
      link: 'https://medium.com/ethereum-optimism/community-launch-7c9a2a9d3e84',
      date: '2021-08-19T00:00:00Z',
      description: 'All smart contracts allowed after prior approval.',
    },
  ],
  knowledgeNuggets: [
    {
      title: 'The Optimistic Vision',
      url: 'https://www.optimism.io/vision',
      thumbnail: NUGGETS.THUMBNAILS.OPTIMISM_VISION,
    },
  ],
  nonTemplateEscrows: [
    discovery.getEscrowDetails({
      address: EthereumAddress('0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65'),
      sinceTimestamp: new UnixTime(1625675779),
      tokens: ['DAI'],
      description: 'DAI Vault for custom DAI Gateway managed by MakerDAO.',
    }),
    discovery.getEscrowDetails({
      // current SNX bridge escrow
      address: EthereumAddress('0x5Fd79D46EBA7F351fe49BFF9E87cdeA6c821eF9f'),
      sinceTimestamp: new UnixTime(1620680982),
      tokens: ['SNX'],
      description: 'SNX Vault for custom SNX Gateway managed by Synthetix.',
    }),
    {
      // old snx bridge
      address: EthereumAddress('0x045e507925d2e05D114534D0810a1abD94aca8d6'),
      sinceTimestamp: new UnixTime(1610668212),
      tokens: ['SNX'],
      isHistorical: true,
    },
    {
      // also old snx bridge
      address: EthereumAddress('0xCd9D4988C0AE61887B075bA77f08cbFAd2b65068'),
      sinceTimestamp: new UnixTime(1620680934),
      tokens: ['SNX'],
      isHistorical: true,
    },
    discovery.getEscrowDetails({
      address: EthereumAddress('0x76943C0D61395d8F2edF9060e1533529cAe05dE6'),
      tokens: ['wstETH'],
      description:
        'wstETH Vault for custom wstETH Gateway. Fully controlled by Lido governance.',
    }),
  ],
  nonTemplatePermissions: [
    ...discovery.getMultisigPermission(
      'ProxyAdminOwner',
      'Owner of the ProxyAdmin. It can upgrade the bridge implementation potentially gaining access to all funds, and change any system component.',
    ),
    ...discovery.getMultisigPermission(
      'FoundationMultisig_1',
      'Member of the ProxyAdminOwner.',
    ),
    ...discovery.getMultisigPermission(
      'SecurityCouncilMultisig',
      'Member of the ProxyAdminOwner.',
      [
        {
          text: 'Security Council members - Optimism Collective forum',
          href: 'https://gov.optimism.io/t/security-council-vote-2-initial-member-ratification/7118',
        },
      ],
    ),
    ...discovery.getMultisigPermission(
      'FoundationMultisig_2',
      'This address is the owner of the following contracts: SystemConfig. It is also designated as a Guardian of the OptimismPortal, meaning it can halt withdrawals, and as a Challenger for state roots.',
    ),
    discovery.contractAsPermissioned(
      discovery.getContract('FeesCollector'),
      'Address collecting sequencer, base and L1 fees from L2.',
    ),
  ],
  nonTemplateContracts: [
    discovery.getContractDetails('SuperchainConfig', {
      description:
        'The SuperchainConfig contract is used to manage global configuration values for multiple OP Chains within a single Superchain network. The SuperchainConfig contract manages the `PAUSED_SLOT`, a boolean value indicating whether the Superchain is paused, and `GUARDIAN_SLOT`, the address of the guardian which can pause and unpause the system.',
      ...l1Upgradeability,
    }),
  ],
  nonTemplateNativeContracts: [
    l2Discovery.getContractDetails(
      'OPToken',
      'The OP token contract. It is owned by the MintManager and can inflate the token supply by 2% annually.',
    ),
    l2Discovery.getContractDetails(
      'MintManager',
      'Controls the OP inflation rate, which is currently hardcoded to 2% annually. It is controlled by the MintManagerOwner multisig, which can also change the OP token owner and therefore the inflation rate.',
    ),
    l2Discovery.getContractDetails('L2CrossDomainMessenger', {
      description:
        'The L2CrossDomainMessenger (L2xDM) contract sends messages from L2 to L1, and relays messages from L1 onto L2 with a system tx. In the event that a message sent from L2 to L1 is rejected for exceeding the L1 gas limit, it can be resubmitted via this contract’s replay function.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('GasPriceOracle', {
      description:
        'Contracts that provide L1 and L2 gas price information, which is derived permissionlessly from the L1 chain.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L2StandardBridge', {
      description:
        'The L2StandardBridge contract is the main entry point to deposit or withdraw ERC20 tokens from L2 to L1. This contract can store any token.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('OptimismMintableERC20Factory', {
      description:
        'Factory contract to create bridge compliant ERC20 IOU token representations of bridged L1 ERC20 tokens.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('OptimismMintableERC721Factory', {
      description:
        'Factory contract to create bridge compliant ERC721 IOU token representations of bridged L1 ERC721 tokens.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L1BlockNumber', {
      description: 'Simple contract that returns the latest L1 block number.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L2ERC721Bridge', {
      description:
        'The L2ERC721Bridge contract is the main entry point to deposit or withdraw ERC721 tokens from L2 to L1. This contract can store any token.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L1Block', {
      description:
        'Simple contract that returns information about the latest L1 block, which is derived permissionlessly from the L1 chain.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L2ToL1MessagePasser', {
      description:
        'Contract used internally by the L2CrossDomainMessenger to send messages to L1, including withdrawals. It can also be used directly as a low-level interface.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('BaseFeeVault', {
      description:
        'Contract collecting base fees, which are withdrawable to the FeesCollector on L1.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('L1FeeVault', {
      description:
        'Contract collecting L1 fees, which are withdrawable to the FeesCollector on L1.',
      ...l2Upgradability,
    }),

    l2Discovery.getContractDetails('SequencerFeeVault', {
      description:
        'Contract collecting sequencer fees, which are withdrawable to the FeesCollector on L1.',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('SchemaRegistry', {
      description:
        'Contracts to register schemas for the Ethereum Attestation Service (EAS).',
      ...l2Upgradability,
    }),
    l2Discovery.getContractDetails('EAS', {
      description:
        'Contract containing the main logic for the Ethereum Attestation Service (EAS).',
      ...l2Upgradability,
    }),
  ],
  nonTemplateNativePermissions: [
    l2Discovery.contractAsPermissioned(
      l2Discovery.getContract('L2ProxyAdmin'),
      'Admin of L2CrossDomainMessenger, GasPriceOracle, L2StandardBridge, SequencerFeeVault, OptimismMintableERC20Factory, L1BlockNumber, L2ERC721Bridge, L1Block, L1ToL2MessagePasser, OptimismMintableERC721Factory, BaseFeeVault, L1FeeVault, SchemaRegistry and EAS contracts.',
    ),
    ...l2Discovery.getMultisigPermission(
      'L2ProxyAdminOwner',
      'Owner of the L2ProxyAdmin. It can update the L2 bridge implementation potentially gaining access to all funds, and change any L2 system component.',
    ),
    ...l2Discovery.getMultisigPermission(
      'MintManagerOwner',
      'Owner of the MintManager. It can change the OP token owner to a different MintManager and therefore change the inflation policy.',
    ),
  ],
  chainConfig: {
    name: 'optimism',
    chainId: 10,
    explorerUrl: 'https://optimistic.etherscan.io',
    explorerApi: {
      url: 'https://api-optimistic.etherscan.io/api',
      type: 'etherscan',
    },
    blockscoutV2ApiUrl: 'https://optimism.blockscout.com/api/v2',
    // ~ Timestamp of block number 138 on Optimism
    // The first full hour timestamp that will return the block number
    // https://optimistic.etherscan.io/block/138
    minTimestampForTvl: UnixTime.fromDate(new Date('2021-11-11T22:00:00Z')),
    multicallContracts: [
      {
        address: EthereumAddress('0xcA11bde05977b3631167028862bE2a173976CA11'),
        batchSize: 150,
        sinceBlock: 4286263,
        version: '3',
        // TODO: fix this
        isNativeBalanceSupported: false,
      },
      {
        sinceBlock: 0,
        batchSize: 150,
        address: EthereumAddress('0xE295aD71242373C37C5FdA7B57F26f9eA1088AFe'),
        version: 'optimism',
        // TODO: fix this
        isNativeBalanceSupported: false,
      },
    ],
    coingeckoPlatform: 'optimistic-ethereum',
  },
  usesBlobs: true,
})
