'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { useI18n } from '@/i18n'
import { useTheme } from '@/components/ThemeProvider'
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
  { id: 'profile', label: 'settings.profile', icon: User },
  { id: 'preferences', label: 'settings.preferences', icon: Palette },
  { id: 'notifications', label: 'settings.notifications', icon: Bell },
  { id: 'security', label: 'settings.security', icon: Lock },
  { id: 'privacy', label: 'settings.privacy', icon: Shield },
] as const

type TabId = typeof tabs[number]['id']

const emailNotificationOptions = [
  { key: 'billReminders', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.billReminders') },
  { key: 'budgetAlerts', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.budgetAlerts') },
  { key: 'weeklyReports', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.weeklyReports') },
  { key: 'monthlyReports', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.monthlyReports') },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['notifications']['email']
  label: (t: ReturnType<typeof useI18n>['t']) => string
}>

const pushNotificationOptions = [
  { key: 'billReminders', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.billReminders') },
  { key: 'budgetAlerts', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.budgetAlerts') },
  { key: 'largeTransactions', label: (t: ReturnType<typeof useI18n>['t']) => t('settings.largeTransactions') },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['notifications']['push']
  label: (t: ReturnType<typeof useI18n>['t']) => string
}>

const privacyOptions = [
  { key: 'showBalance', label: t => t('settings.showBalance') },
  { key: 'analyticsConsent', label: t => t('settings.analyticsConsent') },
] as const satisfies Array<{
  key: keyof UserPreferencesDTO['privacy']
  label: (t: ReturnType<typeof useI18n>['t']) => string
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
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
})

export default function SettingsClient() {
  const { t } = useI18n()
  const { setTheme } = useTheme()
  
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
      toast.success(t('settings.profileUpdated'))
    } catch (error: any) {
      toast.error(error.message || t('settings.failedToUpdate'))
    }
  })

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    try {
      await changePassword.mutateAsync(data)
      toast.success(t('settings.passwordChanged'))
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.message || t('settings.failedToChange'))
    }
  })

  const handlePreferenceUpdate = async (data: UpdatePreferencesDTO, successMessage?: string) => {
    try {
      await updatePreferences.mutateAsync(data)
      toast.success(successMessage || t('settings.preferencesUpdated'))
    } catch (error: any) {
      toast.error(error?.message || t('settings.failedToUpdate'))
    }
  }

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    if (preferences?.theme === theme || updatePreferences.isPending) return
    // Update UI theme immediately
    setTheme(theme)
    void handlePreferenceUpdate({ theme }, t('settings.themeUpdated'))
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const inputElement = event.target

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.selectImage'))
      inputElement.value = ''
      return
    }

    if (file.size > AVATAR_MAX_SIZE) {
      toast.error(t('settings.imageTooLarge'))
      inputElement.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      ;(async () => {
        try {
          await uploadAvatar.mutateAsync(base64)
          toast.success(t('settings.photoUpdated'))
        } catch (error: any) {
          toast.error(error?.message || t('settings.failedToUpload'))
        } finally {
          inputElement.value = ''
        }
      })()
    }
    reader.onerror = () => {
      toast.error(t('settings.failedToRead'))
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
    }
    emailUpdate[key] = value
    void handlePreferenceUpdate(
      {
        notifications: { email: emailUpdate },
      },
      t('settings.notificationPreferencesUpdated')
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
      t('settings.notificationPreferencesUpdated')
    )
  }

  const handlePrivacyChange = (key: keyof UserPreferencesDTO['privacy'], value: boolean) => {
    const privacyUpdate: Partial<UserPreferencesDTO['privacy']> = {
      [key]: value,
    }
    void handlePreferenceUpdate({ privacy: privacyUpdate }, t('settings.privacyPreferencesUpdated'))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('settings.description')}
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
                <span className="font-medium">{t(tab.label)}</span>
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
                    <CardTitle>{t('settings.profileInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onProfileSubmit} className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        {profile?.avatarUrl ? (
                          <Image
                            src={profile.avatarUrl}
                            alt={`${profile.firstName} ${profile.lastName} avatar`}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            priority
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
                            {uploadAvatar.isPending ? t('settings.uploading') : t('settings.uploadPhoto')}
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            {t('settings.maxSize2MB')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('settings.firstNameRequired')}
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
                            {t('settings.lastNameRequired')}
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
                          {t('settings.email')}
                        </label>
                        <input
                          type="email"
                          value={profile?.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {t('settings.emailCannotChange')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.phone')}
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
                          {updateProfile.isPending ? t('common.saving') : t('settings.saveChanges')}
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
                    <CardTitle>{t('settings.appPreferences')}</CardTitle>
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
                          handlePreferenceUpdate({ currency: e.target.value }, t('settings.currencyUpdated'))
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
                        {t('settings.dateFormat')}
                      </label>
                      <select
                        value={preferences?.dateFormat || 'MM/DD/YYYY'}
                        onChange={(e) =>
                          handlePreferenceUpdate({ dateFormat: e.target.value }, t('settings.dateFormatUpdated'))
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
                        {t('settings.timeFormat')}
                      </label>
                      <select
                        value={preferences?.timeFormat || '12h'}
                        onChange={(e) =>
                          handlePreferenceUpdate({ timeFormat: e.target.value as '12h' | '24h' }, t('settings.timeFormatUpdated'))
                        }
                        disabled={updatePreferences.isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                      >
                        <option value="12h">{t('settings.12hour')}</option>
                        <option value="24h">{t('settings.24hour')}</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.notificationSettings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('settings.emailNotifications')}
                      </h3>
                      <div className="space-y-3">
                        {emailNotificationOptions.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {label(t)}
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
                              {label(t)}
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
                    <CardTitle>{t('auth.changePassword')}</CardTitle>
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
                    <CardTitle>{t('settings.privacySettings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {privacyOptions.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {label(t)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {key === 'showBalance'
                              ? t('settings.showBalanceDesc')
                              : t('settings.analyticsConsentDesc')}
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
                        {t('settings.dangerZone')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {t('settings.deleteAccountWarning')}
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
