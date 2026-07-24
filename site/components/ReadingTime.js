export default function ReadingTime({ content }) {
  // Average reading speed: 200 words per minute
  const wordCount = content.split(/\s+/).length
  const minutes = Math.ceil(wordCount / 200)
  
  return (
    <span className="reading-time">
      {minutes} min read
    </span>
  )
}
