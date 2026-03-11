<script setup lang="ts">
import type { ApiResponse, ApiList, CowDetail, BullWithCount } from '~~/types'
import CowDetailHeader from '~/components/cows/CowDetailHeader.vue'
import CowBreedingSection from '~/components/cows/CowBreedingSection.vue'
import CowCalfSection from '~/components/cows/CowCalfSection.vue'
import CowNoteSection from '~/components/cows/CowNoteSection.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<ApiResponse<CowDetail>>(
  `/api/v1/cows/${id}`
)
const cow = computed(() => data.value?.data)

useHead(computed(() => ({ title: cow.value?.officialId ?? 'Vache' })))

watchEffect(() => {
  if (status.value === 'success' && !cow.value) router.replace('/locations')
})

const { data: bullsData } =
  await useFetch<ApiList<BullWithCount>>('/api/v1/bulls')
const bulls = computed(() => bullsData.value?.data ?? [])
</script>

<template>
  <UContainer class="py-10 max-w-3xl">
    <div v-if="status === 'pending'" class="space-y-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
      />
    </div>

    <template v-else-if="cow">
      <CowDetailHeader :cow="cow" @refresh="refresh" />

      <div class="space-y-10">
        <CowBreedingSection :cow="cow" :bulls="bulls" @refresh="refresh" />
        <CowCalfSection :cow="cow" @refresh="refresh" />
        <CowNoteSection
          :notes="cow.notes"
          :cow-id="cow.id"
          @refresh="refresh"
        />
      </div>
    </template>
  </UContainer>
</template>
