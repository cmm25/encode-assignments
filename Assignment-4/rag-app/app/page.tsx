import Link from "next/link"
import { RagStoryGenerator } from "@/components/rag-story-generator"
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <RagStoryGenerator />
  )
}
