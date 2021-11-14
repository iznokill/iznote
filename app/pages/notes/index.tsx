import { Suspense, useState } from "react"
import { usePaginatedQuery, useRouter, BlitzPage, useSession, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getNotes from "app/notes/queries/getNotes"
import logout from "../../auth/mutations/logout"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import SearchIcon from "@mui/icons-material/Search"
import {
  styled,
  alpha,
  List,
  ListItemText,
  ListItem,
  ListItemAvatar,
  Avatar,
  Stack,
} from "@mui/material"
import InputBase from "@mui/material/InputBase"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import AddIcon from "@mui/icons-material/Add"
import FolderIcon from "@mui/icons-material/Folder"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import deleteNote from "../../notes/mutations/deleteNote"
import CloseIcon from "@mui/icons-material/Close"
import NotesIcon from "@mui/icons-material/Notes"

const ITEMS_PER_PAGE = 10

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

const CloseIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "fill",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

export const NotesList = ({ onDelete, searchInput }) => {
  const router = useRouter()
  const session = useSession()
  const page = Number(router.query.page) || 0
  const [{ notes, hasMore }, { refetch }] = usePaginatedQuery(getNotes, {
    orderBy: { updatedAt: "asc" },
    where:
      searchInput !== ""
        ? {
            userId: session?.userId || -1,
            name: {
              startsWith: searchInput,
            },
          }
        : { userId: session?.userId || -1 },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const editNote = (id) => router.push(`/notes/${id}/edit`)
  const deleteNote = async (id) => {
    if (window.confirm("This will be deleted")) {
      await onDelete({ id: id })
      await refetch()
    }
  }

  return (
    <>
      <List dense>
        {notes.map((note) => (
          <ListItem
            key={note.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => editNote(note.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => deleteNote(note.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={note.name} secondary={note.tags.replace(",", " ")} />
          </ListItem>
        ))}
      </List>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={goToPreviousPage} disabled={page === 0}>
          Prev
        </Button>
        <Button variant="contained" onClick={goToNextPage} disabled={!hasMore}>
          Next
        </Button>
      </Stack>
    </>
  )
}

const NotesPage: BlitzPage = () => {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  const [deleteNoteMutation] = useMutation(deleteNote)
  const [searchInput, setSearchInput] = useState({ filled: false, value: "" })
  return (
    <>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
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
            <Search>
              {searchInput.filled ? (
                <CloseIconWrapper>
                  <CloseIcon
                    onClick={() => {
                      setSearchInput({ filled: false, value: "" })
                    }}
                  />
                </CloseIconWrapper>
              ) : (
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
              )}
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                value={searchInput.value}
                onChange={(e) => {
                  setSearchInput({ filled: e.target.value !== "", value: e.target.value })
                }}
              />
            </Search>
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
      <div>
        <Button variant="contained" onClick={() => router.push("/notes/new")}>
          <AddIcon />
          New
        </Button>
        <Suspense fallback={<div>Loading...</div>}>
          <NotesList onDelete={deleteNoteMutation} searchInput={searchInput.value} />
        </Suspense>
      </div>
    </>
  )
}
NotesPage.authenticate = true
NotesPage.getLayout = (page) => <Layout>{page}</Layout>

export default NotesPage
