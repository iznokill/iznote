import { useRouter, useMutation, BlitzPage, Routes, useSession } from "blitz"
import Layout from "app/core/layouts/Layout"
import createNote from "app/notes/mutations/createNote"
import { FORM_ERROR } from "app/notes/components/NoteForm"
import Box from "@mui/material/Box"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import logout from "../../auth/mutations/logout"
import NotesIcon from "@mui/icons-material/Notes"
import TextField from "@mui/material/TextField"
import * as React from "react"
import { WithContext as Tags } from "react-tag-input"
import { createUseStyles } from "react-jss"

const KeyCodes = {
  comma: 188,
  enter: [10, 13],
}

const useStyles = createUseStyles({
  reactTag: {},
  tags: {
    position: "relative",
  },
  tagInput: { borderRadius: 2, display: "inline-block" },
  tagInputField: { height: 31, fontSize: 17, minWidth: 150, width: "100%" },
  selected: {
    fontSize: 18,
    fontWeight: "bold",
    display: "inline-block",
    borderRadius: 2,
  },
  remove: { border: "none", cursor: "pointer", background: "none", color: "black", fontSize: 18 },
})

const delimiters = [...KeyCodes.enter, KeyCodes.comma]

const NewNotePage: BlitzPage = () => {
  const classes = useStyles()
  const router = useRouter()
  const [createNoteMutation] = useMutation(createNote)
  const [logoutMutation] = useMutation(logout)
  const session = useSession()
  const [tags, setTags] = React.useState<{ id: string; text: string }[]>([])

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i))
  }
  const handleAddition = (tag) => {
    setTags([...tags, { id: tag.id, text: tag.text }])
  }
  const handleDrag = (tag, currPos, newPos) => {
    const newTags = tags.slice()
    newTags.splice(currPos, 1)
    newTags.splice(newPos, 0, { id: tag.id, text: tag.text })
    setTags(newTags)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      const note = await createNoteMutation({
        name: data.get("name")?.toString() || "",
        tags: tags.map((tag) => tag.text).join(","),
        userId: session?.userId || -1,
        content: "",
      })
      router.push(Routes.ShowNotePage({ noteId: note.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <div>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={() => router.push("/notes")}
            >
              <NotesIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              Notes
            </Typography>
            <Button
              color="inherit"
              onClick={async () => {
                await logoutMutation()
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        sx={{
          my: 8,
          mx: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Create a new note
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Note Name"
            name="name"
            autoFocus
            autoComplete="off"
          />
          <Tags
            tags={tags}
            handleDelete={handleDelete}
            handleAddition={handleAddition}
            handleDrag={handleDrag}
            delimiters={delimiters}
            inputFieldPosition="inline"
            classNames={{
              tagInputField: classes.tagInputField,
              tags: classes.tags,
              tagInput: classes.tagInput,
              selected: classes.selected,
              remove: classes.remove,
            }}
            placeholder="   Add tags"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Create
          </Button>
        </Box>
      </Box>
    </div>
  )
}

NewNotePage.authenticate = true
NewNotePage.getLayout = (page) => <Layout title={"Create New Note"}>{page}</Layout>

export default NewNotePage
