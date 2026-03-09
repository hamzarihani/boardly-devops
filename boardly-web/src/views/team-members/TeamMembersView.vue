<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import { useTeamStore, type TeamMember } from '@/stores/team'

const { t } = useI18n()
const teamStore = useTeamStore()

const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const tempPassword = ref<string | null>(null)
const search = ref('')
const selectedRole = ref<'ALL' | 'ADMIN' | 'MEMBER'>('ALL')
const roleOptions = [
  { label: 'All roles', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
]
const memberRoleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
]

const editingMemberId = ref<string | null>(null)
const isMemberModalOpen = ref(false)
const formName = ref('')
const formEmail = ref('')
const formRole = ref<'ADMIN' | 'MEMBER'>('MEMBER')

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', cellClass: 'font-medium text-text' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return teamStore.members.filter((member) => {
    const matchesRole = selectedRole.value === 'ALL' || member.role === selectedRole.value
    const matchesSearch =
      !keyword ||
      (member.full_name || '').toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)
    return matchesRole && matchesSearch
  })
})

onMounted(async () => {
  await teamStore.fetchMembers()
})

function resetForm() {
  formName.value = ''
  formEmail.value = ''
  formRole.value = 'MEMBER'
  editingMemberId.value = null
}

function openCreateModal() {
  resetForm()
  isMemberModalOpen.value = true
  tempPassword.value = null
  errorMsg.value = null
  successMsg.value = null
}

function startEdit(row: any) {
  editingMemberId.value = row.id
  formName.value = row.name
  formEmail.value = row.email
  formRole.value = row.role
  isMemberModalOpen.value = true
  tempPassword.value = null
  successMsg.value = null
  errorMsg.value = null
}

function cancelEdit() {
  isMemberModalOpen.value = false
  resetForm()
}

async function saveMember() {
  errorMsg.value = null
  successMsg.value = null
  tempPassword.value = null

  try {
    const payload = {
      name: formName.value.trim(),
      email: formEmail.value.trim(),
      role: formRole.value,
    }

    if (editingMemberId.value) {
      await teamStore.updateMember(editingMemberId.value, payload)
      successMsg.value = 'Team member updated successfully.'
    } else {
      const created = await teamStore.createMember(payload)
      tempPassword.value = created.temporaryPassword ?? null
      successMsg.value = 'Team member added successfully.'
    }

    isMemberModalOpen.value = false
    resetForm()
  } catch (error: any) {
    errorMsg.value = error.message || 'Failed to save team member.'
  }
}

async function removeMember(row: any) {
  const confirmed = window.confirm(`Delete ${row.email}?`)
  if (!confirmed) return

  errorMsg.value = null
  successMsg.value = null

  try {
    await teamStore.deleteMember(row.id)
    successMsg.value = 'Team member deleted successfully.'
    if (editingMemberId.value === row.id) {
      resetForm()
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'Failed to delete team member.'
  }
}
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

      <section
        v-if="teamStore.isLoading"
        class="rounded-xl border border-border bg-card p-4 text-sm text-text/70"
      >
        Loading team members...
      </section>

      <section
        v-if="errorMsg"
        class="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMsg }}
      </section>

      <section
        v-if="successMsg"
        class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700"
      >
        {{ successMsg }}
      </section>

      <section
        v-if="tempPassword"
        class="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700"
      >
        Temporary password for the new user: <span class="font-semibold">{{ tempPassword }}</span>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              v-model="search"
              type="text"
              placeholder="Search by name or email"
              class="w-full md:w-80 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
            <BaseSelectField
              v-model="selectedRole"
              :options="roleOptions"
              class="w-full md:w-52"
            />
          </div>
          <button
            type="button"
            :disabled="teamStore.isLoading"
            @click="openCreateModal"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add Member
          </button>
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

            <template #cell-actions="{ row }">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  :disabled="teamStore.isLoading"
                  @click="startEdit(row)"
                  class="text-xs font-medium text-primary hover:underline disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  :disabled="teamStore.isLoading"
                  @click="removeMember(row)"
                  class="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </template>
          </BaseDataTable>
        </div>
      </section>

      <div
        v-if="isMemberModalOpen"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
        @click.self="cancelEdit"
      >
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-5">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-text">
              {{ editingMemberId ? 'Edit Team Member' : 'Add Team Member' }}
            </h3>
            <button
              type="button"
              class="text-text/70 hover:text-text"
              @click="cancelEdit"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3">
            <input
              v-model="formName"
              type="text"
              placeholder="Full name"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              v-model="formEmail"
              type="email"
              placeholder="member@company.com"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
            <BaseSelectField
              v-model="formRole"
              :options="memberRoleOptions"
            />
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              :disabled="teamStore.isLoading"
              @click="cancelEdit"
              class="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-text hover:bg-background/80"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="teamStore.isLoading"
              @click="saveMember"
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ teamStore.isLoading ? 'Saving...' : (editingMemberId ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
