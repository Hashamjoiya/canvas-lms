/*
 * Copyright (C) 2022 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {VideoConferenceModal} from '../VideoConferenceModal'
import userEvent from '@testing-library/user-event'

describe('VideoConferenceModal', () => {
  const onDismiss = jest.fn()
  const onSubmit = jest.fn()

  const setup = (props = {}) => {
    return render(
      <VideoConferenceModal open onDismiss={onDismiss} onSubmit={onSubmit} {...props} />
    )
  }

  beforeEach(() => {
    onDismiss.mockClear()
    onSubmit.mockClear()
  })

  it('should render', () => {
    const container = setup()
    expect(container).toBeTruthy()
  })

  it('call onDismiss when clicking the cancel button', () => {
    const container = setup()

    fireEvent.click(container.getByTestId('cancel-button'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('do not submit without a conference name', () => {
    const container = setup()

    fireEvent.click(container.getByTestId('submit-button'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submit when correct fields are filled', () => {
    const container = setup()

    userEvent.type(container.getByLabelText('Name'), 'A great video conference name')
    userEvent.type(container.getByLabelText('Description'), 'A great video conference description')
    fireEvent.click(container.getByTestId('submit-button'))

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][1]).toStrictEqual({
      name: 'A great video conference name',
      duration: 60,
      options: ['recording_enabled', 'no_time_limit', 'enable_waiting_room'],
      description: 'A great video conference description',
      invitationOptions: ['invite_all'],
      attendeesOptions: [
        'share_webcam',
        'share_other_webcams',
        'share_microphone',
        'send_public_chat',
        'send_private_chat'
      ]
    })
  })

  it('duration input arrows should work appropriately.', () => {
    const container = setup()
    const durationInput = container.getByTestId('duration-input')
    const arrowUpButton = durationInput
      .querySelector("svg[name='IconArrowOpenUp']")
      .closest('button')
    const arrowDownButton = durationInput
      .querySelector("svg[name='IconArrowOpenDown']")
      .closest('button')

    expect(container.getByLabelText('Duration in Minutes')).toHaveValue('60')

    fireEvent.mouseDown(arrowUpButton)
    fireEvent.mouseDown(arrowUpButton)
    expect(container.getByLabelText('Duration in Minutes')).toHaveValue('62')

    fireEvent.mouseDown(arrowDownButton)
    expect(container.getByLabelText('Duration in Minutes')).toHaveValue('61')
  })

  it('shows attendees tab after clicking it', () => {
    const container = setup()

    fireEvent.click(container.getByText('Attendees'))
    expect(container.getByText('Invite all course members')).toBeInTheDocument()
  })

  it('shows New Video Conference and Create button when not on editing mode', () => {
    const container = setup()

    expect(container.getByText('New Video Conference')).toBeInTheDocument()
    expect(container.getByText('Create')).toBeInTheDocument()
  })

  it('display correct values provided as props on editing mode', () => {
    const container = setup({
      isEditing: true,
      name: 'PHP Introduction',
      duration: 45,
      options: ['recording_enabled'],
      description: 'An introduction to PHP.',
      invitationOptions: [],
      attendeesOptions: ['share_webcam']
    })

    expect(container.getByText('Save')).toBeInTheDocument()
    expect(container.getByText('Edit Video Conference')).toBeInTheDocument()
    expect(container.getByLabelText('Name')).toHaveValue('PHP Introduction')
    expect(container.getByLabelText('Duration in Minutes')).toHaveValue('45')
    expect(container.getByLabelText('Enable recording for this conference').checked).toBeTruthy()
    expect(container.getByLabelText('Description')).toHaveValue('An introduction to PHP.')

    fireEvent.click(container.getByText('Attendees'))
    expect(container.getByLabelText('Share webcam').checked).toBeTruthy()
  })
})
