import { Link, useRouter, useMutation, BlitzPage, Routes, useSession } from "blitz"
import Layout from "app/core/layouts/Layout"
import createNote from "app/notes/mutations/createNote"
import { NoteForm, FORM_ERROR } from "app/notes/components/NoteForm"

const NewNotePage: BlitzPage = () => {
  const router = useRouter()
  const [createNoteMutation] = useMutation(createNote)
  const session = useSession()

  return (
    <div>
      <h1>Create New Note</h1>

      <NoteForm
        submitText="Create Note"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateNote}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const note = await createNoteMutation({ ...values, userId: session.userId })
            router.push(Routes.ShowNotePage({ noteId: note.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.NotesPage()}>
          <a>Notes</a>
        </Link>
      </p>
    </div>
  )
}

NewNotePage.authenticate = true
NewNotePage.getLayout = (page) => <Layout title={"Create New Note"}>{page}</Layout>

export default NewNotePage
