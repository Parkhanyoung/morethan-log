import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import PostCard from "src/routes/Feed/PostList/PostCard"
import { DEFAULT_CATEGORY } from "src/constants"
import usePostsQuery from "src/hooks/usePostsQuery"

const PostList: React.FC = () => {
  const router = useRouter()
  const data = usePostsQuery()
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = `${router.query.tag || ``}` || undefined
  const currentCategory = `${router.query.category || ``}` || DEFAULT_CATEGORY

  useEffect(() => {
    setFilteredPosts(() => {
      let newFilteredPosts = data

      // tag
      if (currentTag) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) => post && post.tags && post.tags.includes(currentTag)
        )
      }

      // category
      if (currentCategory !== DEFAULT_CATEGORY) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) =>
            post && post.category && post.category.includes(currentCategory)
        )
      }

      return newFilteredPosts
    })
  }, [currentTag, currentCategory, setFilteredPosts])

  return (
    <div className="my-2">
      {!filteredPosts.length && (
        <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
      )}
      {filteredPosts.map((post) => (
        <PostCard key={post.id} data={post} />
      ))}
    </div>
  )
}

export default PostList
