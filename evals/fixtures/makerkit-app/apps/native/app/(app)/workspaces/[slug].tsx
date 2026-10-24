import { useLocalSearchParams } from 'expo-router';

import { Card, Row, Spinner, Text } from '@kit/mobile-ui';

import { useWorkspace } from '../../../lib/workspaces/use-workspace';

export default function WorkspaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: workspace, isPending } = useWorkspace(slug);

  if (isPending || !workspace) return <Spinner testID="workspace-loading" />;

  return (
    <Card testID="workspace-card">
      <Text variant="title">{workspace.name}</Text>
      <Row label="Your role" value={workspace.role} testID="workspace-role" />
    </Card>
  );
}
