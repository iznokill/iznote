import React from "react"
import { useCurrentUser } from "../core/hooks/useCurrentUser"
import NotesPage from "./notes"
import LoginPage from "../auth/pages/login"

export const Dashboard = () => {
  const currentUser = useCurrentUser()
  if (!currentUser) {
    return <LoginPage />
  }
  return <NotesPage />
}
