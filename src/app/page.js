export default async function Page(props) {
  const { slug } = await props.params
  return <h1>Blog post: {slug}</h1>
}