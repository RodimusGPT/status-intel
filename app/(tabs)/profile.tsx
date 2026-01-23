import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useUserAudits } from '@/hooks/useAudit';

export default function ProfileScreen() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { audits, loading: auditsLoading, refetch } = useUserAudits();

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <Text style={styles.authIcon}>{'\uD83D\uDC64'}</Text>
        <Text style={styles.authTitle}>Welcome to Status Intel</Text>
        <Text style={styles.authText}>
          Sign in to track your stays and contribute to the intel network.
        </Text>
        <Pressable
          style={styles.signInButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
        <Pressable
          style={styles.registerButton}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRecognitionLabel = (style: string) => {
    switch (style) {
      case 'proactive':
        return 'Proactive';
      case 'asked_received':
        return 'Asked & Received';
      case 'none':
        return 'None';
      case 'denied':
        return 'Denied';
      default:
        return style;
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>
            {profile?.display_name || 'Elite Traveler'}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{audits.length}</Text>
          <Text style={styles.statLabel}>Audits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Set(audits.map((a: any) => a.property_id)).size}
          </Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.created_at
              ? new Date().getFullYear() - new Date(profile.created_at).getFullYear() || '<1'
              : '0'}
          </Text>
          <Text style={styles.statLabel}>Years</Text>
        </View>
      </View>

      {/* Audit History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Audit History</Text>
      </View>

      {auditsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={audits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: any }) => (
            <View style={styles.auditItem}>
              <View style={styles.auditInfo}>
                <Text style={styles.auditProperty}>
                  {item.property?.name || 'Unknown Property'}
                </Text>
                <Text style={styles.auditLocation}>
                  {item.property?.city || 'Unknown City'}
                </Text>
                <Text style={styles.auditDate}>
                  {formatDate(item.stay_date)}
                </Text>
              </View>
              <View style={styles.auditRecognition}>
                <Text style={styles.recognitionBadge}>
                  {getRecognitionLabel(item.recognition_style)}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDCDD'}</Text>
              <Text style={styles.emptyText}>No audits yet</Text>
              <Text style={styles.emptySubtext}>
                Start by submitting your first mission report!
              </Text>
              <Pressable
                style={styles.submitFirstButton}
                onPress={() => router.push('/audit')}
              >
                <Text style={styles.submitFirstButtonText}>Submit Report</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Sign Out Button */}
      <View style={styles.footer}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  historyList: {
    flexGrow: 1,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  auditInfo: {
    flex: 1,
  },
  auditProperty: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  auditLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  auditDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  auditRecognition: {
    marginLeft: 12,
  },
  recognitionBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0ea5e9',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  submitFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  submitFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signOutButton: {
    padding: 14,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  authIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  registerButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
});
