<template>
    <UContainer class="py-10">
        <div class="mb-8 space-y-4">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord
            </h1>

            <!-- Global Search Bar -->
            <div class="relative max-w-2xl">
                <UInput
icon="i-heroicons-magnifying-glass-20-solid" size="xl" color="neutral" :trailing="false"
                    placeholder="Rechercher un animal (n°), un bâtiment, un taureau..." class="w-full">
                    <template #trailing>
                        <div class="flex items-center gap-1">
                            <UKbd>⌘</UKbd>
                            <UKbd>K</UKbd>
                        </div>
                    </template>
                </UInput>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <!-- Card: Lieux & Bâtiments (Root of Hierarchy) -->
            <!-- Link placeholder to /lieux (to be created) -->
            <NuxtLink to="/lieux" class="block group">
                <UCard
                    class="h-full transition-all duration-200 hover:ring-2 hover:ring-primary-500 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <UIcon
name="i-heroicons-home-modern"
                                        class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Lieux & Bâtiments</h3>
                                    <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">Structure</span>
                                </div>
                            </div>
                            <UIcon
name="i-heroicons-arrow-right"
                                class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </template>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Accédez à vos bâtiments, cases et retrouvez vos vaches par emplacement.
                    </p>
                    <template #footer>
                        <div class="flex gap-2">
                            <UBadge color="neutral" variant="soft" size="xs">Bâtiments</UBadge>
                            <UBadge color="neutral" variant="soft" size="xs">Cases</UBadge>
                        </div>
                    </template>
                </UCard>
            </NuxtLink>

            <!-- Card: Mes Taureaux -->
            <NuxtLink to="/taureaux" class="block group">
                <UCard
                    class="h-full transition-all duration-200 hover:ring-2 hover:ring-indigo-500 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                    <!-- Custom icon representation for Bull if standard not available, using shield/alert style or gender-male -->
                                    <UIcon
name="i-mdi-gender-male"
                                        class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Mes Taureaux</h3>
                                    <span
                                        class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Reproduction</span>
                                </div>
                            </div>
                            <UIcon
name="i-heroicons-arrow-right"
                                class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </template>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Gérez vos taureaux, consultez les index génétiques et les historiques.
                    </p>
                </UCard>
            </NuxtLink>

            <!-- Card: Vaches / Troupeau (Direct Access) -->
            <!-- Link placeholder to /vaches (to be created) -->
            <NuxtLink to="/vaches" class="block group">
                <UCard
                    class="h-full transition-all duration-200 hover:ring-2 hover:ring-rose-500 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                    <!-- Icon for Cow/Female -->
                                    <UIcon name="i-mdi-cow" class="w-8 h-8 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Vaches & Veaux</h3>
                                    <span class="text-xs text-rose-600 dark:text-rose-400 font-medium">Troupeau</span>
                                </div>
                            </div>
                            <UIcon
name="i-heroicons-arrow-right"
                                class="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                        </div>
                    </template>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Liste complète des vaches et veaux. Suivi des saillies et vêlages.
                    </p>
                    <template #footer>
                        <div class="flex gap-2">
                            <UBadge color="neutral" variant="soft" size="xs">Saillies</UBadge>
                            <UBadge color="neutral" variant="soft" size="xs">Prophylaxie</UBadge>
                        </div>
                    </template>
                </UCard>
            </NuxtLink>

        </div>
    </UContainer>
</template>