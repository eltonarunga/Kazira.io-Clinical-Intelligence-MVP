import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = 'Kazira Clinical Intelligence'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default function twitterImage() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 64,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white', width: 120, height: 120, borderRadius: 20, marginBottom: 40, fontSize: 80 }}>
          K
        </div>
        <div style={{ fontWeight: 700 }}>Kazira Clinical Intelligence</div>
        <div style={{ fontSize: 32, marginTop: 20, color: '#666' }}>Revenue intelligence for private dental clinics</div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
