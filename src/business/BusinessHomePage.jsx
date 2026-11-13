import React, { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import BusinessNav from './BusinessNav'
import BusinessFooter from './BusinessFooter'
import { ForIndividualsBar } from './sections'
import { HeroA, HeroB } from './home/Hero'
import { Proof, PathsA, PathsB, StoryAI, DeepDiveA, DeepDiveB, StoryOther, Beyond, Enterprise, Faq, FinalCta } from './home/Sections'
import { useHomeVariants, VariantToggle } from './home/variants'
import '../pages/home-rebrand.css'
import '../pages/leland-ai.css'
import './business.css'
import './home/home.css'

// business.joinleland.com homepage, built on Dave's wireframe Idea A.
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
      <div className="bh">
        <BusinessNav variant="transparent" />
        {v.hero === 'b' ? <HeroA /> : <HeroB />}
        <Proof />
        {v.paths === 'b' ? <PathsB /> : <PathsA />}
        <StoryAI />
        {v.deep === 'b' ? <DeepDiveB /> : <DeepDiveA />}
        <StoryOther />
        <Beyond />
        <Enterprise />
        <Faq />
        <FinalCta />
        <ForIndividualsBar />
        <BusinessFooter />
        <VariantToggle v={v} choose={choose} />
      </div>
    </MotionConfig>
  )
}
