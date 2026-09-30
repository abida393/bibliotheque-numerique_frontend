import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider }      from '@/contexts/auth-context'
import { FavoritesProvider } from '@/contexts/favorites-context'
import { Layout }            from '@/components/layout'
import { RequireAuth, RequireAdmin, RequireModerator, GuestOnly } from '@/components/route-guard'

import { Catalogue }           from '@/components/catalogue'
import { LoginPage }           from '@/pages/login'
import { RegisterPage }        from '@/pages/register'
import { ResourceDetail }      from '@/pages/resource-detail'
import { EditResourcePage }    from '@/pages/edit-resource'
import { CategoryDetailPage }  from '@/pages/category-detail'
import { FavoritesPage }       from '@/pages/favorites'
import { MyContributionsPage } from '@/pages/my-contributions'
import { SubmitResourcePage }  from '@/pages/submit-resource'
import { MyHistoryPage }       from '@/pages/my-history'
import { AdminDashboard }      from '@/pages/admin/dashboard'
import { AdminUsersPage }      from '@/pages/admin/users'
import { AdminModerationPage } from '@/pages/admin/moderation'
import { AdminCategoriesPage } from '@/pages/admin/categories'
import { NotFoundPage }        from '@/pages/not-found'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <Toaster richColors position="top-right" />
          <Routes>
            {/* Guest-only */}
            <Route path="/connexion"  element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/inscription" element={<GuestOnly><RegisterPage /></GuestOnly>} />

            {/* Protected (requires auth) — all wrapped in Layout (Navbar + Outlet) */}
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index            element={<Catalogue />} />
              <Route path="ressources/:id" element={<ResourceDetail />} />
              <Route path="ressources/:id/modifier" element={<EditResourcePage />} />
              <Route path="categories/:id" element={<CategoryDetailPage />} />
              <Route path="favoris"   element={<FavoritesPage />} />
              <Route path="mes-contributions" element={<MyContributionsPage />} />
              <Route path="contribuer"  element={<SubmitResourcePage />} />
              <Route path="historique"  element={<MyHistoryPage />} />

              {/* Admin & Moderator */}
              <Route path="admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="admin/utilisateurs" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              <Route path="admin/moderation"   element={<RequireModerator><AdminModerationPage /></RequireModerator>} />
              <Route path="admin/categories"   element={<RequireModerator><AdminCategoriesPage /></RequireModerator>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
