/**
 * CloudStack Version Manager
 * Provides runtime version detection and feature availability checking
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import type { ListCapabilitiesResponse, CloudStackCapability } from '../types/index.js';

/**
 * Parsed semantic version
 */
export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  build: number;
  raw: string;
}

/**
 * Feature flags based on CloudStack capabilities
 */
export interface FeatureFlags {
  kubernetes: boolean;
  kubernetesExperimental: boolean;
  securityGroups: boolean;
  kvmSnapshots: boolean;
  dynamicRoles: boolean;
  userPublicTemplates: boolean;
  projectInviteRequired: boolean;
  allowUserCreateProjects: boolean;
  allowUserViewDestroyedVm: boolean;
  allowUserExpungeRecoverVm: boolean;
  firewallRulesUi: boolean;
  regionSecondaryEnabled: boolean;
}

/**
 * Version-specific features introduced in each CloudStack version
 */
export const VERSION_FEATURES: Record<string, string[]> = {
  '4.16': ['base'],
  '4.17': ['improved_kubernetes'],
  '4.18': ['dynamic_roles', 'enhanced_networking'],
  '4.19': ['autoscaling_improvements'],
  '4.20': ['storage_enhancements'],
  '4.21': ['kubernetes_csi_preview'],
  '4.22': ['kubernetes_csienabled', 'kubernetes_templatename', 'storage_capacitybytes', 'network_name_filter', 'snapshot_volumename'],
};

/**
 * CloudStack Version Manager singleton
 */
export class VersionManager {
  private static instance: VersionManager | null = null;
  private version: ParsedVersion | null = null;
  private capabilities: CloudStackCapability | null = null;
  private featureFlags: FeatureFlags | null = null;
  private initialized = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  /**
   * Reset instance (for testing)
   */
  static reset(): void {
    VersionManager.instance = null;
  }

  /**
   * Initialize version manager by querying CloudStack
   */
  async initialize(client: CloudStackClient): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const result = await client.listCapabilities<ListCapabilitiesResponse>();
      this.capabilities = result.listcapabilitiesresponse?.capability || null;

      if (this.capabilities?.cloudstackversion) {
        this.version = this.parseVersion(this.capabilities.cloudstackversion);
      }

      this.featureFlags = this.buildFeatureFlags();
      this.initialized = true;
    } catch (_error) {
      // Non-fatal - continue without version info
      this.initialized = true;
    }
  }

  /**
   * Parse CloudStack version string (e.g., "4.20.2.0")
   */
  private parseVersion(versionString: string): ParsedVersion {
    const parts = versionString.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      build: parts[3] || 0,
      raw: versionString,
    };
  }

  /**
   * Build feature flags from capabilities
   */
  private buildFeatureFlags(): FeatureFlags {
    const cap = this.capabilities;
    return {
      kubernetes: cap?.kubernetesserviceenabled ?? false,
      kubernetesExperimental: cap?.kubernetesclusterexperimentalfeaturesenabled ?? false,
      securityGroups: cap?.securitygroupsenabled ?? false,
      kvmSnapshots: cap?.kvmsnapshotenabled ?? false,
      dynamicRoles: cap?.dynamicrolesenabled ?? false,
      userPublicTemplates: cap?.userpublictemplateenabled ?? false,
      projectInviteRequired: cap?.projectinviterequired ?? false,
      allowUserCreateProjects: cap?.allowusercreateprojects ?? false,
      allowUserViewDestroyedVm: cap?.allowuserviewdestroyedvm ?? false,
      allowUserExpungeRecoverVm: cap?.allowuserexpungerecovervm ?? false,
      firewallRulesUi: cap?.firewallrulesuisenabled ?? false,
      regionSecondaryEnabled: cap?.regionsecondaryenabled ?? false,
    };
  }

  /**
   * Get current version
   */
  getVersion(): ParsedVersion | null {
    return this.version;
  }

  /**
   * Get version string
   */
  getVersionString(): string {
    return this.version?.raw || 'Unknown';
  }

  /**
   * Get capabilities
   */
  getCapabilities(): CloudStackCapability | null {
    return this.capabilities;
  }

  /**
   * Get feature flags
   */
  getFeatureFlags(): FeatureFlags | null {
    return this.featureFlags;
  }

  /**
   * Check if current version is at least the specified version
   */
  isAtLeast(major: number, minor: number = 0, patch: number = 0): boolean {
    if (!this.version) {
      return false; // Unknown version, assume old
    }

    if (this.version.major > major) return true;
    if (this.version.major < major) return false;

    if (this.version.minor > minor) return true;
    if (this.version.minor < minor) return false;

    return this.version.patch >= patch;
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(feature: keyof FeatureFlags): boolean {
    return this.featureFlags?.[feature] ?? false;
  }

  /**
   * Check if a version-specific API feature is available
   */
  hasVersionFeature(feature: string): boolean {
    if (!this.version) {
      return false;
    }

    // Find which version introduced this feature
    for (const [ver, features] of Object.entries(VERSION_FEATURES)) {
      if (features.includes(feature)) {
        const [major, minor] = ver.split('.').map(Number);
        return this.isAtLeast(major, minor);
      }
    }

    return false;
  }

  /**
   * Get list of available version-specific features
   */
  getAvailableVersionFeatures(): string[] {
    if (!this.version) {
      return [];
    }

    const available: string[] = [];
    for (const [ver, features] of Object.entries(VERSION_FEATURES)) {
      const [major, minor] = ver.split('.').map(Number);
      if (this.isAtLeast(major, minor)) {
        available.push(...features);
      }
    }
    return available;
  }

  /**
   * Check if Kubernetes features are available
   */
  isKubernetesAvailable(): boolean {
    return this.hasFeature('kubernetes');
  }

  /**
   * Check if security groups are available
   */
  isSecurityGroupsAvailable(): boolean {
    return this.hasFeature('securityGroups');
  }

  /**
   * Get human-readable status report
   */
  getStatusReport(): string {
    const lines: string[] = [
      'CloudStack Version Manager Status',
      '================================',
      `Version: ${this.getVersionString()}`,
      `Initialized: ${this.initialized}`,
      '',
      'Feature Flags:',
    ];

    if (this.featureFlags) {
      for (const [key, value] of Object.entries(this.featureFlags)) {
        lines.push(`  ${key}: ${value ? 'Yes' : 'No'}`);
      }
    }

    lines.push('');
    lines.push('Available Version Features:');
    const features = this.getAvailableVersionFeatures();
    if (features.length > 0) {
      for (const feature of features) {
        lines.push(`  - ${feature}`);
      }
    } else {
      lines.push('  (none detected)');
    }

    return lines.join('\n');
  }
}

/**
 * Get the global version manager instance
 */
export function getVersionManager(): VersionManager {
  return VersionManager.getInstance();
}
