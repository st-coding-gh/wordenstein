import { TCard } from '@/types/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import Image from 'next/image'
import { Carousel } from 'antd'

export function Card({ card }: { card: TCard }) {
  return (
    <div className="flex flex-col gap-5">
      <CardWord card={card} />
      <CardImage card={card} />
      <CardTranscription card={card} />
      <CardDefinition card={card} />
      <CardTranslation card={card} />
      <CardComparison card={card} />
      <CardExamplesBestChoice card={card} />
      <CardExamplesNotBestChoice card={card} />
      <CardImagePrompt card={card} />
    </div>
  )
}

export function CardError({ message }: { message: string }) {
  return <p className="text-app-danger font-black">{message}</p>
}

export function CardHeading({ text }: { text: string }) {
  return (
    <h2 className="font-black text-2xl mb-2 text-app-primary-600">{text}</h2>
  )
}

export function CardWord({ card }: { card: TCard }) {
  return (
    <>
      {card?.word ? (
        <h1 className="font-black text-app-secondary text-4xl">{card.word}</h1>
      ) : (
        <CardError message="word not found" />
      )}
    </>
  )
}

export function CardImage({ card }: { card: TCard }) {
  if (!card.id) return null

  // Get image IDs from card.image array, with fallback to legacy system
  const getImageIds = (): string[] => {
    if (card.image && Array.isArray(card.image) && card.image.length > 0) {
      return card.image
    }
    // Fallback: use card ID for legacy system
    return [card.id!]
  }

  const imageIds = getImageIds()

  if (imageIds.length === 1) {
    // Single image - display normally
    return (
      <div className="w-full max-w-[500px] rounded-lg overflow-hidden">
        <img
          src={`/api/image/${imageIds[0]}`}
          alt={card.imagePrompt}
          className="w-full"
          onError={(e) => {
            // Fallback to legacy API if direct image API fails
            const target = e.target as HTMLImageElement
            target.src = `/api/card/image/${card.id}`
          }}
        />
      </div>
    )
  }

  // Multiple images - display with carousel
  return (
    <div className="w-full max-w-[1000px] rounded-lg overflow-hidden">
      <Carousel
        dots={true}
        arrows={true}
        autoplay={false}
        slidesToShow={2}
        slidesToScroll={2}
        responsive={[
          {
            breakpoint: 768, // md breakpoint
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            }
          }
        ]}
        className="card-image-carousel"
      >
        {imageIds.map((imageId, index) => (
          <div key={imageId} className="px-1">
            <img
              src={`/api/image/${imageId}`}
              alt={`${card.imagePrompt} - Image ${index + 1}`}
              className="w-full h-auto object-cover rounded"
              onError={(e) => {
                // Fallback for legacy images
                const target = e.target as HTMLImageElement
                if (imageId === card.id) {
                  target.src = `/api/card/image/${card.id}`
                }
              }}
            />
          </div>
        ))}
      </Carousel>

      {/* Image counter */}
      <div className="text-center text-sm text-gray-500 mt-2">
        {imageIds.length} image{imageIds.length > 1 ? 's' : ''}
        {imageIds.length > 2 && (
          <span className="ml-1 text-xs">
            (showing {Math.min(2, imageIds.length)} at once on large screens)
          </span>
        )}
      </div>
    </div>
  )
}

export function CardTranscription({ card }: { card: TCard }) {
  return (
    <>
      {card?.transcription ? (
        <div>
          <CardHeading text="Transcription" />
          <p className="">{card.transcription}</p>
        </div>
      ) : (
        <CardError message="transcription not found" />
      )}
    </>
  )
}

export function CardDefinition({ card }: { card: TCard }) {
  return (
    <>
      {card?.definition ? (
        <div>
          <CardHeading text="Definition" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {card.definition as string}
          </ReactMarkdown>
        </div>
      ) : (
        <CardError message="definition not found" />
      )}
    </>
  )
}

export function CardTranslation({ card }: { card: TCard }) {
  return (
    <>
      {card?.translation ? (
        <div>
          <CardHeading text="Translation" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {card.translation as string}
          </ReactMarkdown>
        </div>
      ) : (
        <CardError message="translation not found" />
      )}
    </>
  )
}

export function CardComparison({ card }: { card: TCard }) {
  return (
    <>
      {card?.comparison ? (
        <div>
          <CardHeading text="Comparison" />
          <div className="overflow-x-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                table: ({ node, ...props }) => (
                  <table
                    className="w-full border-collapse border border-app-primary"
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-app-primary bg-app-primary-900 px-4 py-2 text-left font-semibold"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="border border-app-primary px-4 py-2"
                    {...props}
                  />
                ),
              }}
            >
              {card.comparison as string}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <CardError message="comparison not found" />
      )}
    </>
  )
}

export function CardExamplesBestChoice({ card }: { card: TCard }) {
  return (
    <>
      {card?.examplesBestChoice ? (
        <div>
          <CardHeading text="best choice" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {card.examplesBestChoice as string}
          </ReactMarkdown>
        </div>
      ) : (
        <CardError message="examples (best choice) not found" />
      )}
    </>
  )
}

export function CardExamplesNotBestChoice({ card }: { card: TCard }) {
  return (
    <>
      {card?.examplesNotBestChoice ? (
        <div>
          <CardHeading text="not best choice" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {card.examplesNotBestChoice as string}
          </ReactMarkdown>
        </div>
      ) : (
        <CardError message="examples (not best choice) not found" />
      )}
    </>
  )
}

export function CardImagePrompt({ card }: { card: TCard }) {
  if (card.id) return null

  return (
    <>
      {card?.imagePrompt ? (
        <div>
          <CardHeading text="Image prompt" />
          <p className="">{card.imagePrompt}</p>
        </div>
      ) : (
        <CardError message="image prompt not found" />
      )}
    </>
  )
}
