import React, { useState } from 'react'
import TopicNode from './TopicNode'

export default function CategorySection({ category, topics, onStart }) {
  const [activeTopicId, setActiveTopicId] = useState(null)

  const handleToggle = (topicId) => {
    setActiveTopicId((prev) => (prev === topicId ? null : topicId))
  }

  const color = category.color || '#6366f1'
  const completedCount = topics.filter((t) => t.isCompleted).length
  const totalCount = topics.length

  return (
    <section className="mb-12 rounded-2xl p-2"
      style={{backgroundColor: `${color}15`, borderColor: `${color}40`}}
    >
      <div 
        className="rounded-2xl p-4 gap-4 border border-b-8 space-y-7"
        style={{ backgroundColor: `${color}50`, borderColor: `${color}80` }}>
        <div
        className="flex items-center gap-4"
      >
          {category.icon_url && (
            <img src={category.icon_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
          )}
          <div className="flex-1 min-w-0 bg-white/50 rounded-2xl p-4">
            <h2 className="text-lg font-black text-slate-800">{category.title}</h2>
            {category.description && (
              <p className="text-sm text-slate-500 font-bold mt-0.5 truncate">{category.description}</p>
            )}
          </div>
          <div
            className="shrink-0 text-xs font-black px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {completedCount}/{totalCount}
          </div>
        </div>

        <div className="mx-2 h-3 rounded-full bg-white overflow-hidden border border-b-2"
          style={{borderColor: color}}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: totalCount ? `${(completedCount / totalCount) * 100}%` : '5%',
              backgroundColor: color,
            }}
          />
        </div>
      
      </div>

      <div className="relative">
        <div className="flex flex-col gap-10">
          {topics.map((topic, idx) => {
            const isEven = idx % 2 === 0
            const isLast = idx === topics.length - 1

            return (
              <div key={topic.id} className="relative flex flex-col items-center mt-8">
                
                {!isLast && (
                  <div
                    className="absolute"
                    style={{
                      left: '40%',
                      top: '50px',
                      width: '200px',
                      borderTop: `4px dashed ${color}`,
                      transform: `translateX(${isEven ? '0' : '-100%'}) rotate(${isEven ? 35 : -35}deg)`,
                      transformOrigin: isEven ? 'left center' : 'right center',
                    }}
                  />
                )}
                <div className="relative flex justify-center">
                  <div
                    style={{
                      transform: `translateX(${isEven ? '-120px' : '120px'})`,
                    }}
                  >
                    <TopicNode
                      topic={topic}
                      color={color}
                      index={idx}
                      onStart={onStart}
                      isActive={activeTopicId === topic.id}
                      onToggle={() => handleToggle(topic.id)}
                      disableOffset={true}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
