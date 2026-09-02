import type { CSSProperties } from 'react'

interface HeadlineProps {
  text: string
}

/** Splits the headline into words that cascade in one-by-one. */
export function Headline({ text }: HeadlineProps) {
  const words = text.split(' ')
  return (
    <h1 className="headline" aria-label={text}>
      {words.map((word, i) => (
        <span className="word" style={{ '--word-i': i } as CSSProperties} key={`${word}-${i}`} aria-hidden="true">
          <span className="word-inner">{word}</span>
        </span>
      ))}
    </h1>
  )
}
