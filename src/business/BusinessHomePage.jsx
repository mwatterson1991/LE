import React, { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import BusinessNav from './BusinessNav'
import BusinessFooter from './BusinessFooter'
import { HeroB } from './home/Hero'
import { HeroHifi, TransformCards, Stories } from './home/Hifi'
import { Proof, PathsA, PathsB, DeepDiveB, Beyond, Enterprise, Faq, FinalCta } from './home/Sections'
import { useHomeVariants, VariantToggle } from './home/variants'
import '../pages/home-rebrand.css'
import '../pages/leland-ai.css'
import './business.css'
import './home/home.css'
import './home/hifi.css'

// business.joinleland.com homepage: Dave's wireframe Idea A in his Hi-fi 4
// style (black page, white product UI on vivid imagery).
// Copy lives in ./content/home.js. Sections with alternatives are switched by
// the Variations pill (bottom left); option A is the default.

function useBodyClass() {
  useEffect(() => {
    document.title = 'Leland for Business'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home', 'biz-page')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home', 'biz-page')
    }
  }, [])
}

export default function BusinessHomePage() {
  useBodyClass()
  const [v, choose] = useHomeVariants()

  return (
    <MotionConfig reducedMotion="user">
      <div className="bh bh-darkpage">
        <BusinessNav variant="transparent" />
        {v.hero === 'b' ? <HeroB /> : <HeroHifi />}
        {v.deep === 'b' ? <DeepDiveB /> : <TransformCards />}
        <Stories />
        <Proof />
        {v.paths === 'b' ? <PathsB /> : <PathsA />}
        <Beyond />
        <Enterprise />
        <Faq />
        <FinalCta />
        <BusinessFooter />
        <VariantToggle v={v} choose={choose} />
      </div>
    </MotionConfig>
  )
}
