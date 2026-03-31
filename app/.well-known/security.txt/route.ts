export async function GET() {
  const content = `Contact: mailto:security@kazira.io
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en
`
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
