import { Suspense } from "react"
import {
  Head,
  Link,
  usePaginatedQuery,
  useRouter,
  BlitzPage,
  Routes,
  useSession,
  useMutation,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getNotes from "app/notes/queries/getNotes"
import logout from "../../auth/mutations/logout"

const ITEMS_PER_PAGE = 100

export const NotesList = () => {
  const router = useRouter()
  const session = useSession()
  const page = Number(router.query.page) || 0
  const [{ notes, hasMore }] = usePaginatedQuery(getNotes, {
    orderBy: { id: "asc" },
    where: { userId: session?.userId || -1 },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <Link href={Routes.ShowNotePage({ noteId: note.id })}>
              <a>{note.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const NotesPage: BlitzPage = () => {
  const [logoutMutation] = useMutation(logout)

  return (
    <>
      <div>
        <title>Notes</title>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
      </div>

      <div>
        <p>
          <Link href={Routes.NewNotePage()}>
            <a>Create Note</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <NotesList />
        </Suspense>
      </div>
    </>
  )
}

NotesPage.authenticate = true
NotesPage.getLayout = (page) => <Layout>{page}</Layout>

export default NotesPage
