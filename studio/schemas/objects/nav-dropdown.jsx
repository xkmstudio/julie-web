import { ArrowBendRightDown, WarningCircle, MapPin } from 'phosphor-react'

export default {
  title: 'Dropdown',
  name: 'navDropdown',
  type: 'object',
  icon: ArrowBendRightDown,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      description: 'Text to Display'
    },
    {
      title: 'Dropdown Items',
      name: 'dropdownItems',
      type: 'array',
      of: [{ type: 'link' }],
      hidden: ({ parent }) => parent.isLocation
    },
  ]
}
