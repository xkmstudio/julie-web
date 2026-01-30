import React, { useCallback, useState, useEffect } from 'react'
import { Image, VideoCamera } from 'phosphor-react'
import { Grid, Button, Popover, Flex, Box, Switch } from '@sanity/ui'
import { ArrayOfPrimitivesFunctions } from 'sanity'
import styles from './styles/components.css?inline'

function ArrayFunctions(props) {
  const { schemaType, onValueCreate, onItemAppend, onChange, value } = props
  const [hasItem, setHasItem] = useState(false)

  const insertItem = React.useCallback(
    itemType => {
      onItemAppend(onValueCreate(itemType))
    },
    [onValueCreate, onItemAppend]
  )

  const handleAddImage = useCallback(() => {
    insertItem(schemaType.of[0])
  }, [schemaType, insertItem])

  const handleAddVideo = useCallback(() => {
    insertItem(schemaType.of[1])
  }, [schemaType, insertItem])

  useEffect(() => {
    setHasItem(value?.length)
  }, [onChange, onItemAppend, onValueCreate, value])

  return (
    <Grid columns={2} gap={2}>
      {!hasItem && (
        <>
<Button
  icon={() => <Image />}
  text="Add Image"
  color="#ff0000"
  className={styles.button}
  backgroundColor={'#ffffff'}
  onClick={handleAddImage}
/>
          <Button
            icon={() => <VideoCamera />}
            text={`Add Video`}
            backgroundColor={'#ffffff'}
            className={styles.button}
            onClick={handleAddVideo}
          />
        </>
      )}
    </Grid>
  )
}

function CustomArrayInput(props) {
  return props.renderDefault({ ...props, arrayFunctions: ArrayFunctions })
}

export default {
  title: 'Media',
  name: 'media',
  type: 'object',
  icon: Image,
  fields: [
    {
      title: 'Image or Video',
      name: 'media',
      type: 'array',
      of: [{ type: 'asset' }, { type: 'video' }],
      validation: Rule => Rule.max(1),
      components: {
        input: CustomArrayInput
      }
    },
    {
      title: 'Include in Gallery',
      name: 'includeInGallery',
      type: 'boolean',
      description: 'When enabled, this thumbnail will appear as the first image in the product gallery.',
      initialValue: false
    }
  ],
  preview: {
    select: {
      image: 'media[0].image',
      imageAlt: 'media[0].alt',
      video: 'media[0].video.asset.url'
    },
    prepare({ image, imageAlt, video }) {
      const displayTitle = imageAlt || (image ? 'Image' : 'Video')
      
      return {
        title: displayTitle,
        media: video ? (
          <div style={{ width: '100%', height: '100%' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              src={video}
            ></video>
          </div>
        ) : (
          image || Image
        )
      }
    }
  }
}
