import { Dialog, Tab } from '@headlessui/react'
import { Fragment, useState } from 'react'

const avatars = [
  '🐵','🐱','🐙','🐼','🦁','🦎','🐧','🪼',
  '👽','💀','🐶','🐠','🦄','🐨','🐰','🐸'
]

export default function ProfilePictureModal({ open, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white shadow-lg p-6">
          <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
            Profile picture
          </Dialog.Title>

          <Tab.Group>
            <Tab.List className="flex space-x-2 border-b mb-4">
              {['Avatar','Upload'].map(tab => (
                <Tab key={tab}
                  className={({ selected }) =>
                    `px-3 py-1.5 text-sm font-semibold rounded-t-md 
                     ${selected ? 'bg-white border border-b-0 border-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }>
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* Avatar Grid */}
              <Tab.Panel>
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(icon)}
                      className={`w-16 h-16 flex items-center justify-center rounded-full border text-2xl
                        ${selectedAvatar === icon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </Tab.Panel>

              {/* Upload */}
              <Tab.Panel>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full border flex items-center justify-center text-4xl">
                    {uploadedFile ? (
                      <img src={URL.createObjectURL(uploadedFile)} alt="preview" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      '🐰'
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md">
                    Upload a photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setUploadedFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // handle save logic
                console.log(selectedAvatar || uploadedFile)
                onClose()
              }}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
