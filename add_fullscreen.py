import sys

file_path = 'src/pages/Home.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Maximize to imports
if 'Maximize' not in content:
    content = content.replace(
        '  Star,\n} from "lucide-react";',
        '  Star,\n  Maximize,\n} from "lucide-react";'
    )

# 2. Find the video section and add the button
old_reveal = '<Reveal className="relative overflow-hidden rounded-[50px] bg-black md:mx-[-18px] lg:mx-[-28px] min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center justify-center">'
new_reveal = '<Reveal className="relative overflow-hidden rounded-[50px] bg-black md:mx-[-18px] lg:mx-[-28px] min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center justify-center group">'

if old_reveal in content:
    content = content.replace(old_reveal, new_reveal)

old_video = '''              <video
                src="/chroma-kameleon.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />'''

new_video = '''              <video
                id="hero-video"
                src="/chroma-kameleon.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const videoElement = document.getElementById("hero-video");
                  if (videoElement) {
                    if (videoElement.requestFullscreen) {
                      videoElement.requestFullscreen();
                    } else if (videoElement.webkitRequestFullscreen) {
                      videoElement.webkitRequestFullscreen();
                    } else if (videoElement.msRequestFullscreen) {
                      videoElement.msRequestFullscreen();
                    }
                  }
                }}
                className="absolute bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:bottom-10 md:right-10"
                aria-label="Plein écran"
              >
                <Maximize size={24} />
              </button>'''

if old_video in content:
    content = content.replace(old_video, new_video)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fullscreen button added.')
