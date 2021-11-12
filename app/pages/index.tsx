import { BlitzPage } from "blitz"
import { Suspense } from "react"
import Layout from "../core/layouts/Layout"
import { Dashboard } from "./Dashboard"

const Home: BlitzPage = () => {
  return (
    <Suspense fallback="Loading...">
      <Dashboard />
    </Suspense>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
