<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'

type MemberRole = 'ADMIN' | 'MEMBER'
type MemberStatus = 'ACTIVE' | 'INVITED'

interface TeamMember {
  id: number
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
}

const { t } = useI18n()

const search = ref('')
const selectedRole = ref<'ALL' | MemberRole>('ALL')
const roleOptions = [
  { label: 'All roles', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
]

const members = ref<TeamMember[]>([
  { id: 1, name: 'Hamza Benali', email: 'hamza@boardly.dev', role: 'ADMIN', status: 'ACTIVE' },
  { id: 2, name: 'Nina Laurent', email: 'nina@boardly.dev', role: 'MEMBER', status: 'ACTIVE' },
  { id: 3, name: 'Omar Rami', email: 'omar@boardly.dev', role: 'MEMBER', status: 'INVITED' },
  { id: 4, name: 'Lea Martin', email: 'lea@boardly.dev', role: 'MEMBER', status: 'ACTIVE' },
])

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', cellClass: 'font-medium text-text' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return members.value.filter((member) => {
    const matchesRole = selectedRole.value === 'ALL' || member.role === selectedRole.value
    const matchesSearch =
      !keyword ||
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)
    return matchesRole && matchesSearch
  })
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full">
      <section class="rounded-xl border border-border bg-card p-5">
        <h1 class="text-2xl font-bold text-text">{{ t('nav.team') }}</h1>
        <p class="mt-1 text-sm text-text/70">
          Manage team access and monitor account status.
        </p>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email"
            class="w-full md:max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField
            v-model="selectedRole"
            :options="roleOptions"
            class="w-full md:w-52"
          />
        </div>

        <div class="mt-5">
          <BaseDataTable
            :columns="columns"
            :rows="filteredMembers"
            row-key="id"
            :paginate="true"
            :page-size="5"
            :page-size-options="[5, 10, 20]"
            empty-text="No team members found."
          >
            <template #cell-role="{ row }">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="row.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-background text-text/80 border border-border'"
              >
                {{ row.role }}
              </span>
            </template>

            <template #cell-status="{ row }">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="row.status === 'ACTIVE' ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'"
              >
                {{ row.status }}
              </span>
            </template>
          </BaseDataTable>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
