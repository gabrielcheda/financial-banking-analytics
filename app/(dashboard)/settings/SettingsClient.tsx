'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Trash2,
  Upload,
  Check,
} from 'lucide-react'
import { useProfile, useUpdateProfile, useChangePassword, useUpdatePreferences, useUploadAvatar } from '@/hooks/useUser'
import type { UpdatePreferencesDTO, UserPreferencesDTO } from '@/types/dto'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Shield },
] as const

type TabId = typeof tabs[number]['id']

const emailNotificationOptions = [
  { key: 'billReminders', label: 'Bill Reminders' },
  { key: 'budgetAlerts', label: 'Budget Alerts' },
  { key: 'weeklyReports', label: 'Weekly Reports' },
  { key: 'monthlyReports', label: 'Monthly Reports' },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['notifications']['email']
  label: string
}>

const pushNotificationOptions = [
  { key: 'billReminders', label: 'Bill Reminders' },
  { key: 'budgetAlerts', label: 'Budget Alerts' },
  { key: 'largeTransactions', label: 'Large Transactions' },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['notifications']['push']
  label: string
}>

const privacyOptions = [
  { key: 'showBalance', label: 'Show account balances' },
  { key: 'analyticsConsent', label: 'Enable analytics & insights' },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['privacy']
  label: string
}>

const AVATAR_MAX_SIZE = 2 * 1024 * 1024 // 2MB

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const updatePreferences = useUpdatePreferences()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const preferences = profile?.preferences

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
    } : undefined,
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = profileForm.handleSubmit(async (data) => {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  })

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    try {
      await changePassword.mutateAsync(data)
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    }
  })

  const handlePreferenceUpdate = async (data: UpdatePreferencesDTO, successMessage = 'Preferences updated') => {
    try {
      await updatePreferences.mutateAsync(data)
      toast.success(successMessage)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update preferences')
    }
  }

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    if (preferences?.theme === theme || updatePreferences.isPending) return
    void handlePreferenceUpdate({ theme }, 'Theme updated')
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const inputElement = event.target

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      inputElement.value = ''
      return
    }

    if (file.size > AVATAR_MAX_SIZE) {
      toast.error('Image must be smaller than 2MB')
      inputElement.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      ;(async () => {
        try {
          await uploadAvatar.mutateAsync(base64)
          toast.success('Profile photo updated')
        } catch (error: any) {
          toast.error(error?.message || 'Failed to upload photo')
        } finally {
          inputElement.value = ''
        }
      })()
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
      inputElement.value = ''
    }

    reader.readAsDataURL(file)
  }

  const handleEmailNotificationChange = (
    key: keyof UserPreferencesDTO['notifications']['email'],
    value: boolean
  ) => {
    const currentEmail = (preferences?.notifications?.email ??
      {}) as Partial<UserPreferencesDTO['notifications']['email']>
    const emailUpdate: UserPreferencesDTO['notifications']['email'] = {
      enabled: currentEmail?.enabled ?? false,
      billReminders: currentEmail?.billReminders ?? false,
      budgetAlerts: currentEmail?.budgetAlerts ?? false,
      weeklyReports: currentEmail?.weeklyReports ?? false,
      monthlyReports: currentEmail?.monthlyReports ?? false,
      goalMilestones: currentEmail?.goalMilestones ?? false,
      securityAlerts: currentEmail?.securityAlerts ?? false,
      ...(currentEmail?.weeklyReport !== undefined
        ? { weeklyReport: currentEmail.weeklyReport }
        : {}),
    }
    emailUpdate[key] = value
    void handlePreferenceUpdate(
      {
        notifications: { email: emailUpdate },
      },
      'Notification preferences updated'
    )
  }

  const handlePushNotificationChange = (
    key: keyof UserPreferencesDTO['notifications']['push'],
    value: boolean
  ) => {
    const currentPush = (preferences?.notifications?.push ??
      {}) as Partial<UserPreferencesDTO['notifications']['push']>
    const pushUpdate: UserPreferencesDTO['notifications']['push'] = {
      enabled: currentPush.enabled ?? false,
      billReminders: currentPush.billReminders ?? false,
      budgetAlerts: currentPush.budgetAlerts ?? false,
      largeTransactions: currentPush.largeTransactions ?? false,
    }
    pushUpdate[key] = value
    void handlePreferenceUpdate(
      {
        notifications: { push: pushUpdate },
      },
      'Notification preferences updated'
    )
  }

  const handlePrivacyChange = (key: keyof UserPreferencesDTO['privacy'], value: boolean) => {
    const privacyUpdate: Partial<UserPreferencesDTO['privacy']> = {
      [key]: value,
    }
    void handlePreferenceUpdate({ privacy: privacyUpdate }, 'Privacy preferences updated')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <aside className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {profileLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onProfileSubmit} className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        {profile?.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                            {profile?.firstName?.[0]}
                            {profile?.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadAvatar.isPending}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadAvatar.isPending ? 'Uploading...' : 'Upload Photo'}
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            JPG, PNG or GIF. Max size 2MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name *
                          </label>
                          <input
                            {...profileForm.register('firstName')}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                          />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600 mt-1">
                              {profileForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            {...profileForm.register('lastName')}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                          />
                          {profileForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600 mt-1">
                              {profileForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          {...profileForm.register('phone')}
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <Card>
                  <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => handleThemeChange(theme)}
                            disabled={updatePreferences.isPending}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              preferences?.theme === theme
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Palette className="w-6 h-6" />
                              <span className="font-medium capitalize">{theme}</span>
                              {preferences?.theme === theme && (
                                <Check className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferences?.currency || 'USD'}
                        onChange={(e) =>
                          handlePreferenceUpdate({ currency: e.target.value }, 'Currency updated')
                        }
                        disabled={updatePreferences.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="BRL">BRL - Brazilian Real</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select
                        value={preferences?.dateFormat || 'MM/DD/YYYY'}
                        onChange={(e) =>
                          handlePreferenceUpdate({ dateFormat: e.target.value }, 'Date format updated')
                        }
                        disabled={updatePreferences.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Format
                      </label>
                      <select
                        value={preferences?.timeFormat || '12h'}
                        onChange={(e) =>
                          handlePreferenceUpdate({ timeFormat: e.target.value as '12h' | '24h' }, 'Time format updated')
                        }
                        disabled={updatePreferences.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {emailNotificationOptions.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {label}
                            </span>
                            <input
                              type="checkbox"
                              checked={Boolean(preferences?.notifications?.email?.[key])}
                              onChange={(event) => handleEmailNotificationChange(key, event.target.checked)}
                              disabled={updatePreferences.isPending}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        {pushNotificationOptions.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {label}
                            </span>
                            <input
                              type="checkbox"
                              checked={Boolean(preferences?.notifications?.push?.[key])}
                              onChange={(event) => handlePushNotificationChange(key, event.target.checked)}
                              disabled={updatePreferences.isPending}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password *
                        </label>
                        <input
                          {...passwordForm.register('currentPassword')}
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password *
                        </label>
                        <input
                          {...passwordForm.register('newPassword')}
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          {...passwordForm.register('confirmPassword')}
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={changePassword.isPending}
                        >
                          {changePassword.isPending ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {privacyOptions.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {key === 'showBalance'
                              ? 'Display your account balance in the dashboard'
                              : 'Allow collection of anonymized usage data'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(preferences?.privacy?.[key])}
                          onChange={(event) => handlePrivacyChange(key, event.target.checked)}
                          disabled={updatePreferences.isPending}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    ))}

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
