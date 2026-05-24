'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { BotPersona } from './form'

const skinTones = [
  { name: 'Sand', value: '#f2c29b' },
  { name: 'Honey', value: '#c98955' },
  { name: 'Amber', value: '#9b5f3b' },
  { name: 'Deep', value: '#5d3528' },
]

const hairColors = [
  { name: 'Midnight', value: '#1f1a17' },
  { name: 'Brown', value: '#5a3827' },
  { name: 'Copper', value: '#a84d2a' },
  { name: 'Blonde', value: '#d9aa55' },
]

const hairStyles = ['Crop', 'Curls', 'Side part'] as const

type HairStyle = (typeof hairStyles)[number]

const createEye = (x: number) => {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 24, 24),
    new THREE.MeshStandardMaterial({ color: '#201b1f', roughness: 0.45 })
  )
  eye.position.set(x, 0.14, 0.48)
  return eye
}

const addHair = (group: THREE.Group, style: HairStyle, color: string) => {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.72 })

  if (style === 'Crop') {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.52, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), material)
    hair.scale.set(1.08, 0.48, 1)
    hair.position.set(0, 0.35, 0.03)
    group.add(hair)
    return
  }

  if (style === 'Curls') {
    for (let index = 0; index < 9; index += 1) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), material)
      const angle = (index / 8) * Math.PI * 1.1 + Math.PI * 0.95
      curl.position.set(Math.cos(angle) * 0.42, 0.34 + Math.sin(angle) * 0.14, 0.12)
      curl.scale.set(1, 0.85, 0.9)
      group.add(curl)
    }
    return
  }

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), material)
  cap.scale.set(1.05, 0.45, 1)
  cap.position.set(0, 0.35, 0.03)
  group.add(cap)

  const sweep = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), material)
  sweep.scale.set(1.35, 0.55, 0.65)
  sweep.rotation.z = -0.34
  sweep.position.set(-0.22, 0.28, 0.27)
  group.add(sweep)
}

type MascotStudioProps = {
  selectedPersona: BotPersona
}

const MascotStudio = ({ selectedPersona }: MascotStudioProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [skinTone, setSkinTone] = useState(skinTones[0].value)
  const [hairColor, setHairColor] = useState(hairColors[0].value)
  const [hairStyle, setHairStyle] = useState<HairStyle>('Side part')

  useEffect(() => {
    if (!mountRef.current) return

    const host = mountRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 0.02, 4.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight('#ffffff', 2.1))

    const keyLight = new THREE.DirectionalLight('#fff4df', 3.4)
    keyLight.position.set(2.4, 3.4, 4)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#b9d8ff', 2.2)
    rimLight.position.set(-3, 1.4, -1.4)
    scene.add(rimLight)

    const mascot = new THREE.Group()
    scene.add(mascot)

    const isVoice = selectedPersona === 'voice'
    const skinMaterial = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.52 })
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.66, 64, 64), skinMaterial)
    head.scale.set(selectedPersona === 'mascot' ? 0.98 : 0.9, selectedPersona === 'mascot' ? 0.98 : 1.06, 0.86)
    mascot.add(head)

    addHair(mascot, hairStyle, hairColor)
    if (isVoice) {
      const headsetMaterial = new THREE.MeshStandardMaterial({ color: '#7b56d9', roughness: 0.4 })
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.025, 12, 80, Math.PI), headsetMaterial)
      band.rotation.set(Math.PI, 0, 0)
      band.position.set(0, 0.32, 0.04)
      mascot.add(band)
      const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.28, 6, 12), headsetMaterial)
      mic.rotation.z = -0.75
      mic.position.set(0.46, -0.02, 0.46)
      mascot.add(mic)
    }

    const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), skinMaterial)
    leftEar.position.set(-0.58, 0.03, 0.02)
    mascot.add(leftEar)

    const rightEar = leftEar.clone()
    rightEar.position.x = 0.58
    mascot.add(rightEar)

    mascot.add(createEye(-0.22))
    mascot.add(createEye(0.22))

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.014, 12, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#5a3125', roughness: 0.45 })
    )
    smile.rotation.set(Math.PI, 0, 0)
    smile.position.set(0, -0.2, 0.52)
    mascot.add(smile)

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.36, 32),
      skinMaterial
    )
    neck.position.set(0, -0.78, 0)
    mascot.add(neck)

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.54, 0.55, 8, 32),
      new THREE.MeshStandardMaterial({ color: isVoice ? '#44306f' : selectedPersona === 'mascot' ? '#ff8f3d' : '#242c42', roughness: 0.6 })
    )
    body.position.set(0, -1.23, 0)
    body.scale.set(1.18, 0.9, 0.75)
    mascot.add(body)

    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#ffb14a', roughness: 0.35, metalness: 0.1 })
    )
    badge.position.set(0.22, -1.03, 0.45)
    mascot.add(badge)

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.08, 0.08, 64),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
    )
    platform.position.set(0, -1.7, -0.06)
    scene.add(platform)

    let frame = 0
    let animationId = 0
    const animate = () => {
      frame += 0.018
      mascot.rotation.y = Math.sin(frame) * 0.22
      mascot.position.y = Math.sin(frame * 1.4) * 0.035
      badge.scale.setScalar(1 + Math.sin(frame * 3) * 0.06)
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    }

    window.addEventListener('resize', onResize)
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      host.removeChild(renderer.domElement)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach((item) => item.dispose())
          else material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [hairColor, hairStyle, selectedPersona, skinTone])

  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(220px,0.9fr)_minmax(260px,1fr)]">
        <div className="min-h-[260px] bg-[radial-gradient(circle_at_50%_20%,#fff0ce_0%,transparent_34%),linear-gradient(145deg,#f8fafc,#eef4ff)] p-3">
          <div ref={mountRef} className="h-[260px] w-full" />
        </div>
        <div className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">Mascot creator</p>
            <h3 className="mt-1 text-xl font-bold text-gravel">Design the widget face</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Pick a style above, then tune skin tone, hair and color for the live website widget preview.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-gray-500">Skin tone</p>
              <div className="flex flex-wrap gap-2">
                {skinTones.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => setSkinTone(tone.value)}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 shadow-sm transition hover:scale-105',
                      skinTone === tone.value ? 'border-gray-950' : 'border-white'
                    )}
                    style={{ backgroundColor: tone.value }}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase text-gray-500">Hair style</p>
              <div className="flex flex-wrap gap-2">
                {hairStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setHairStyle(style)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-xs font-semibold transition',
                      hairStyle === style
                        ? 'border-gray-950 bg-gray-950 text-white'
                        : 'border-border bg-white text-gray-700 hover:bg-muted'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase text-gray-500">Hair color</p>
              <div className="flex flex-wrap gap-2">
                {hairColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setHairColor(color.value)}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 shadow-sm transition hover:scale-105',
                      hairColor === color.value ? 'border-gray-950' : 'border-white'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MascotStudio
