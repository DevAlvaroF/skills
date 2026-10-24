import { PageBody, PageHeader } from '@kit/ui/page'
import { requireUser } from '@kit/supabase/require-user'

import { database } from '~/lib/server/database'
import { createWorkspaceService } from '~/lib/server/workspace.service'

export const metadata = { title: 'Workspace' }

export default async function WorkspacePage({ params }: { params: Promise<{ account: string }> }) {
  const { account } = await params
  const user = await requireUser()
  const workspace = createWorkspaceService(database).getWorkspace(account, user.id)
  if (!workspace) return null

  return (
    <>
      <PageHeader title={workspace.name} />
      <PageBody>
        <p data-test="workspace-role">Your role: {workspace.role}</p>
      </PageBody>
    </>
  )
}
