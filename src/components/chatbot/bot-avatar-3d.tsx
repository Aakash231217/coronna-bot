'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

type BotAvatar3DProps = {
  className?: string
  size?: number
  /** When true the character lip-syncs (mouth moves) and keeps waving. */
  speaking?: boolean
}

/**
 * A lightweight three.js character used as the chatbot mascot.
 * - Always does a gentle idle bob + occasional hand wave.
 * - While `speaking` is true it waves continuously and animates the mouth
 *   to fake lip-syncing.
 */
const BotAvatar3D = ({ className, size = 80, speaking = false }: BotAvatar3DProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const speakingRef = useRef<boolean>(speaking)

  // keep the latest speaking value available inside the animation loop
  useEffect(() => {
    speakingRef.current = speaking
  }, [speaking])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = size
    const height = size

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0.4, 6)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ---- Lighting ---------------------------------------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
    keyLight.position.set(2, 3, 4)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x9ab8ff, 0.5)
    rimLight.position.set(-3, 1, -2)
    scene.add(rimLight)

    // ---- Character --------------------------------------------------------
    const character = new THREE.Group()
    scene.add(character)

    const skin = new THREE.MeshStandardMaterial({
      color: 0xffb347,
      roughness: 0.55,
      metalness: 0.05,
    })
    const accent = new THREE.MeshStandardMaterial({
      color: 0x5b5bd6,
      roughness: 0.5,
      metalness: 0.1,
    })
    const dark = new THREE.MeshStandardMaterial({ color: 0x2f2a25 })
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x5a2d1a })

    // Body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 0.9, 8, 16),
      accent
    )
    body.position.y = -1.15
    character.add(body)

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), skin)
    head.position.y = 0.55
    character.add(head)

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.16, 16, 16)
    const leftEye = new THREE.Mesh(eyeGeo, dark)
    leftEye.position.set(-0.32, 0.7, 0.85)
    character.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, dark)
    rightEye.position.set(0.32, 0.7, 0.85)
    character.add(rightEye)

    // Eye highlights
    const hlGeo = new THREE.SphereGeometry(0.05, 8, 8)
    const leftHl = new THREE.Mesh(hlGeo, white)
    leftHl.position.set(-0.27, 0.75, 0.99)
    character.add(leftHl)
    const rightHl = new THREE.Mesh(hlGeo, white)
    rightHl.position.set(0.37, 0.75, 0.99)
    character.add(rightHl)

    // Mouth (scaled vertically to fake lip-sync)
    const mouth = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 20),
      mouthMat
    )
    mouth.position.set(0, 0.28, 0.92)
    mouth.scale.set(1, 0.18, 0.4)
    character.add(mouth)

    // Arms — pivot at the shoulder so we can rotate them to wave.
    const armGeo = new THREE.CapsuleGeometry(0.16, 0.7, 6, 12)

    const leftArm = new THREE.Group()
    leftArm.position.set(-0.72, -0.55, 0.1)
    const leftArmMesh = new THREE.Mesh(armGeo, skin)
    leftArmMesh.position.y = -0.45
    leftArm.add(leftArmMesh)
    character.add(leftArm)

    const rightArm = new THREE.Group()
    rightArm.position.set(0.72, -0.55, 0.1)
    const rightArmMesh = new THREE.Mesh(armGeo, skin)
    rightArmMesh.position.y = -0.45
    rightArm.add(rightArmMesh)
    // a little hand at the end of the waving arm
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skin)
    hand.position.y = -0.85
    rightArm.add(hand)
    character.add(rightArm)

    // ---- Animation loop ---------------------------------------------------
    const clock = new THREE.Clock()
    let frameId = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const isSpeaking = speakingRef.current

      // idle bob + subtle head sway
      character.position.y = Math.sin(t * 1.6) * 0.05
      head.rotation.z = Math.sin(t * 0.8) * 0.04
      head.rotation.y = Math.sin(t * 0.5) * 0.08

      // Waving: continuous while speaking, periodic bursts while idle.
      const waveBurst = isSpeaking || Math.sin(t * 0.6) > 0.6
      if (waveBurst) {
        rightArm.rotation.z = -2.1 + Math.sin(t * 10) * 0.5
      } else {
        // rest position by the side, eased
        rightArm.rotation.z = THREE.MathUtils.lerp(
          rightArm.rotation.z,
          0.1,
          0.1
        )
      }
      // left arm just rests with a tiny sway
      leftArm.rotation.z = -0.12 + Math.sin(t * 1.4) * 0.05

      // Lip-sync: open/close the mouth quickly while speaking.
      if (isSpeaking) {
        const open = 0.18 + Math.abs(Math.sin(t * 14)) * 0.7
        mouth.scale.y = open
      } else {
        mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, 0.18, 0.2)
      }

      // occasional blink
      const blink = Math.sin(t * 3.3) > 0.97 ? 0.1 : 1
      leftEye.scale.y = blink
      rightEye.scale.y = blink

      renderer.render(scene, camera)
    }
    animate()

    // ---- Cleanup ----------------------------------------------------------
    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[]
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [size])

  return (
    <div
      ref={mountRef}
      className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}

export default BotAvatar3D
