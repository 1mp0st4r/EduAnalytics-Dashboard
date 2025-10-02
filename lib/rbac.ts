/**
 * Role-Based Access Control (RBAC) System
 * Provides fine-grained permissions for different user roles
 */

export type UserRole = 'admin' | 'principal' | 'teacher' | 'mentor' | 'student' | 'parent'

export type Permission = 
  | 'read:students'
  | 'write:students'
  | 'delete:students'
  | 'read:reports'
  | 'write:reports'
  | 'delete:reports'
  | 'read:analytics'
  | 'write:analytics'
  | 'read:notifications'
  | 'write:notifications'
  | 'read:settings'
  | 'write:settings'
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:audit'
  | 'export:data'
  | 'manage:roles'
  | 'access:admin'
  | 'access:mentor'
  | 'access:student'

export interface RolePermissions {
  [key: string]: Permission[]
}

export interface UserPermissions {
  userId: string
  role: UserRole
  permissions: Permission[]
  customPermissions?: Permission[]
  restrictions?: string[]
  expiresAt?: Date
}

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'read:students',
    'write:students',
    'delete:students',
    'read:reports',
    'write:reports',
    'delete:reports',
    'read:analytics',
    'write:analytics',
    'read:notifications',
    'write:notifications',
    'read:settings',
    'write:settings',
    'read:users',
    'write:users',
    'delete:users',
    'read:audit',
    'export:data',
    'manage:roles',
    'access:admin'
  ],
  principal: [
    'read:students',
    'write:students',
    'read:reports',
    'write:reports',
    'read:analytics',
    'read:notifications',
    'write:notifications',
    'read:settings',
    'export:data',
    'access:admin'
  ],
  teacher: [
    'read:students',
    'write:students',
    'read:reports',
    'write:reports',
    'read:analytics',
    'read:notifications',
    'write:notifications',
    'access:admin'
  ],
  mentor: [
    'read:students',
    'write:students',
    'read:reports',
    'read:analytics',
    'read:notifications',
    'write:notifications',
    'access:mentor'
  ],
  student: [
    'read:students',
    'read:reports',
    'read:notifications',
    'access:student'
  ],
  parent: [
    'read:students',
    'read:reports',
    'read:notifications',
    'access:student'
  ]
}

// Resource-based access control
export interface ResourceAccess {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'export'
  conditions?: {
    field?: string
    operator?: 'equals' | 'in' | 'not_in'
    value?: any
  }[]
}

export class RBACService {
  private static instance: RBACService
  private userPermissions: Map<string, UserPermissions> = new Map()

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService()
    }
    return RBACService.instance
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(userId: string, permission: Permission): boolean {
    const userPerms = this.userPermissions.get(userId)
    if (!userPerms) return false

    // Check if permissions have expired
    if (userPerms.expiresAt && userPerms.expiresAt < new Date()) {
      this.userPermissions.delete(userId)
      return false
    }

    return userPerms.permissions.includes(permission) || 
           userPerms.customPermissions?.includes(permission) || false
  }

  /**
   * Check if user can access specific resource with action
   */
  canAccess(userId: string, resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'export'): boolean {
    const userPerms = this.userPermissions.get(userId)
    if (!userPerms) return false

    // Map resource + action to permission
    const permission = this.mapResourceToPermission(resource, action)
    return this.hasPermission(userId, permission)
  }

  /**
   * Set user permissions
   */
  setUserPermissions(userId: string, role: UserRole, customPermissions?: Permission[], restrictions?: string[]): void {
    const basePermissions = ROLE_PERMISSIONS[role] || []
    const allPermissions = [...basePermissions, ...(customPermissions || [])]

    this.userPermissions.set(userId, {
      userId,
      role,
      permissions: allPermissions,
      customPermissions,
      restrictions,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
  }

  /**
   * Get user role
   */
  getUserRole(userId: string): UserRole | null {
    const userPerms = this.userPermissions.get(userId)
    return userPerms?.role || null
  }

  /**
   * Get all user permissions
   */
  getUserPermissions(userId: string): Permission[] {
    const userPerms = this.userPermissions.get(userId)
    return userPerms?.permissions || []
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission))
  }

  /**
   * Remove user permissions
   */
  removeUserPermissions(userId: string): void {
    this.userPermissions.delete(userId)
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): string[] {
    const users: string[] = []
    for (const [userId, userPerms] of this.userPermissions) {
      if (userPerms.role === role) {
        users.push(userId)
      }
    }
    return users
  }

  /**
   * Map resource and action to permission
   */
  private mapResourceToPermission(resource: string, action: string): Permission {
    const resourceMap: { [key: string]: { [key: string]: Permission } } = {
      students: {
        create: 'write:students',
        read: 'read:students',
        update: 'write:students',
        delete: 'delete:students',
        export: 'export:data'
      },
      reports: {
        create: 'write:reports',
        read: 'read:reports',
        update: 'write:reports',
        delete: 'delete:reports',
        export: 'export:data'
      },
      analytics: {
        create: 'write:analytics',
        read: 'read:analytics',
        update: 'write:analytics',
        delete: 'delete:analytics',
        export: 'export:data'
      },
      notifications: {
        create: 'write:notifications',
        read: 'read:notifications',
        update: 'write:notifications',
        delete: 'delete:notifications',
        export: 'export:data'
      },
      settings: {
        create: 'write:settings',
        read: 'read:settings',
        update: 'write:settings',
        delete: 'delete:settings',
        export: 'export:data'
      },
      users: {
        create: 'write:users',
        read: 'read:users',
        update: 'write:users',
        delete: 'delete:users',
        export: 'export:data'
      },
      audit: {
        create: 'read:audit',
        read: 'read:audit',
        update: 'read:audit',
        delete: 'read:audit',
        export: 'export:data'
      }
    }

    return resourceMap[resource]?.[action] || 'read:students'
  }

  /**
   * Validate resource access with conditions
   */
  validateResourceAccess(userId: string, access: ResourceAccess, data?: any): boolean {
    if (!this.canAccess(userId, access.resource, access.action)) {
      return false
    }

    // Apply additional conditions if specified
    if (access.conditions && data) {
      for (const condition of access.conditions) {
        const { field, operator, value } = condition
        if (!field || !operator) continue

        const fieldValue = this.getFieldValue(data, field)
        
        switch (operator) {
          case 'equals':
            if (fieldValue !== value) return false
            break
          case 'in':
            if (!Array.isArray(value) || !value.includes(fieldValue)) return false
            break
          case 'not_in':
            if (Array.isArray(value) && value.includes(fieldValue)) return false
            break
        }
      }
    }

    return true
  }

  /**
   * Get nested field value from object
   */
  private getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Get permission description
   */
  getPermissionDescription(permission: Permission): string {
    const descriptions: { [key: string]: string } = {
      'read:students': 'View student information',
      'write:students': 'Create and update student records',
      'delete:students': 'Delete student records',
      'read:reports': 'View reports',
      'write:reports': 'Create and update reports',
      'delete:reports': 'Delete reports',
      'read:analytics': 'View analytics and insights',
      'write:analytics': 'Create and update analytics',
      'read:notifications': 'View notifications',
      'write:notifications': 'Create and send notifications',
      'read:settings': 'View system settings',
      'write:settings': 'Modify system settings',
      'read:users': 'View user accounts',
      'write:users': 'Create and update user accounts',
      'delete:users': 'Delete user accounts',
      'read:audit': 'View audit logs',
      'export:data': 'Export data and reports',
      'manage:roles': 'Manage user roles and permissions',
      'access:admin': 'Access admin dashboard',
      'access:mentor': 'Access mentor dashboard',
      'access:student': 'Access student dashboard'
    }

    return descriptions[permission] || permission
  }
}

// Export singleton instance
export const rbacService = RBACService.getInstance()

// Helper function to check permissions in components
export function usePermissions(userId: string) {
  return {
    hasPermission: (permission: Permission) => rbacService.hasPermission(userId, permission),
    hasAnyPermission: (permissions: Permission[]) => rbacService.hasAnyPermission(userId, permissions),
    hasAllPermissions: (permissions: Permission[]) => rbacService.hasAllPermissions(userId, permissions),
    canAccess: (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'export') => 
      rbacService.canAccess(userId, resource, action),
    getUserRole: () => rbacService.getUserRole(userId),
    getUserPermissions: () => rbacService.getUserPermissions(userId)
  }
}
