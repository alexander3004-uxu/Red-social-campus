import React, { useState } from 'react';
import { Post, Story } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface FeedScreenProps {
  posts: Post[];
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onToggleEventRsvp: (postId: string) => void;
  onOpenPdf: (pdfName: string, content?: string) => void;
  onOpenStory: (story: Story) => void;
  stories: Story[];
  onOpenCreatePost: (type?: 'text' | 'pdf' | 'poll' | 'photo') => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  posts,
  onToggleLike,
  onToggleSave,
  onVotePoll,
  onToggleEventRsvp,
  onOpenPdf,
  onOpenStory,
  stories,
  onOpenCreatePost,
}) => {
  const [activeCategory, setActiveCategory] = useState<'para-ti' | 'carrera' | 'eventos' | 'oficial'>('para-ti');
  const [commentOpenPostId, setCommentOpenPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const filteredPosts = posts.filter((post) => {
    if (activeCategory === 'carrera') return post.tags.some(t => t.toLowerCase().includes('ingenieria') || t.toLowerCase().includes('algoritmo'));
    if (activeCategory === 'eventos') return !!post.event;
    if (activeCategory === 'oficial') return post.authorTag.includes('Oficial') || post.verified;
    return true;
  });

  return (
    <div className="flex flex-col w-full mx-auto pt-1 pb-20 md:pb-8">
      {/* Campus Stories Rail */}
      <section className="w-full pt-1 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 px-4 w-max">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onOpenStory(story)}
              className="flex flex-col items-center gap-1.5 focus:outline-none group"
              type="button"
            >
              {story.isAdd ? (
                <div className="relative w-16 h-16 rounded-full bg-[#e2e7ff] p-0.5 flex items-center justify-center transition-transform active:scale-95">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <img
                      alt="Tu historia"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      src={story.avatarUrl}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#3525cd] via-[#712ae2] to-[#6ffbbe] transition-transform active:scale-95 shadow-xs">
                  <div className="w-full h-full rounded-full p-0.5 bg-white overflow-hidden">
                    <img
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={story.avatarUrl}
                    />
                  </div>
                </div>
              )}
              <span className="text-[10px] font-semibold text-[#131b2e] truncate max-w-[64px]">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Feed Categories Filter Tabs */}
      <div className="w-full px-4 mb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory('para-ti')}
            type="button"
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              activeCategory === 'para-ti'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e2e7ff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            Para ti
          </button>
          <button
            onClick={() => setActiveCategory('carrera')}
            type="button"
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              activeCategory === 'carrera'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e2e7ff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#3525cd]">terminal</span>
            <span>Mi Carrera (Ingeniería)</span>
          </button>
          <button
            onClick={() => setActiveCategory('eventos')}
            type="button"
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              activeCategory === 'eventos'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e2e7ff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#712ae2]">celebration</span>
            <span>Eventos</span>
          </button>
          <button
            onClick={() => setActiveCategory('oficial')}
            type="button"
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              activeCategory === 'oficial'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#e2e7ff] text-[#464555] hover:bg-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#006e4b]">verified</span>
            <span>Oficial</span>
          </button>
        </div>
      </div>

      {/* Quick Share Box */}
      <section className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04)] border border-[#eaedff] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#eaedff]">
              <img
                alt={CURRENT_USER.name}
                className="w-full h-full object-cover"
                src={CURRENT_USER.avatar}
              />
            </div>
            <button
              onClick={() => onOpenCreatePost('text')}
              className="flex-1 text-left bg-[#f2f3ff] hover:bg-[#eaedff] text-[#464555] px-4 py-2.5 rounded-full text-xs transition-colors flex items-center justify-between"
              type="button"
            >
              <span>¿Qué está pasando en el campus hoy?</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                edit_note
              </span>
            </button>
          </div>
          <div className="flex items-center justify-around pt-2 border-t border-[#f2f3ff]">
            <button
              onClick={() => onOpenCreatePost('pdf')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#464555] hover:bg-[#f2f3ff] text-xs font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[#3525cd] text-[20px]">
                picture_as_pdf
              </span>
              <span>Apuntes</span>
            </button>
            <button
              onClick={() => onOpenCreatePost('poll')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#464555] hover:bg-[#f2f3ff] text-xs font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[#712ae2] text-[20px]">
                poll
              </span>
              <span>Encuesta</span>
            </button>
            <button
              onClick={() => onOpenCreatePost('photo')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#464555] hover:bg-[#f2f3ff] text-xs font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[#006e4b] text-[20px]">
                add_photo_alternate
              </span>
              <span>Foto</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feed Stream */}
      <div className="flex flex-col gap-4 px-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04)] border border-[#eaedff] flex flex-col gap-3 transition-all"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#eaedff]">
                  <img
                    alt={post.authorName}
                    className="w-full h-full object-cover"
                    src={post.authorAvatar}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#131b2e] truncate">
                      {post.authorName}
                    </span>
                    {post.verified && (
                      <span
                        className="material-symbols-outlined text-[16px] text-[#3525cd]"
                        title="Estudiante Verificado"
                      >
                        verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${post.authorTagColor}`}
                    >
                      {post.authorTag}
                    </span>
                    <span className="text-[11px] text-[#464555]">
                      {post.timeAgo}
                    </span>
                  </div>
                </div>
              </div>

              <button
                aria-label="Opciones"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
            </div>

            {/* Post Content */}
            <p className="text-sm text-[#131b2e] leading-relaxed">
              {post.content}
            </p>

            {/* Attached PDF Card */}
            {post.pdfAttachment && (
              <div className="bg-[#f2f3ff] rounded-xl p-3 flex items-center justify-between gap-3 border border-[#e2e7ff]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">
                      picture_as_pdf
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#131b2e] truncate">
                      {post.pdfAttachment.name}
                    </span>
                    <div className="flex items-center gap-2 text-[#464555] text-[11px]">
                      <span>{post.pdfAttachment.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-[#005338] font-bold">
                        <span className="material-symbols-outlined text-[14px]">
                          download_done
                        </span>{' '}
                        {post.pdfAttachment.downloads} descargas
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onOpenPdf(
                      post.pdfAttachment!.name,
                      post.pdfAttachment!.fileContent
                    )
                  }
                  className="h-9 px-3.5 rounded-full bg-[#3525cd] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#4f46e5] active:scale-95 transition-all shrink-0 shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Bajar</span>
                </button>
              </div>
            )}

            {/* Interactive Poll */}
            {post.poll && (
              <div className="flex flex-col gap-2.5 py-1">
                {post.poll.options.map((option) => {
                  const total = post.poll!.totalVotes;
                  const percentage = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                  const isSelected = post.poll!.userVotedOption === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => onVotePoll(post.id, option.id)}
                      className={`group w-full text-left relative overflow-hidden bg-[#f2f3ff] rounded-xl p-3.5 transition-all border ${
                        isSelected ? 'border-[#3525cd] shadow-xs' : 'border-transparent'
                      }`}
                      type="button"
                    >
                      {/* Animated Fill Bar */}
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                          isSelected ? 'bg-[#3525cd]/20' : 'bg-[#e2e7ff]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>

                      <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-[#3525cd]' : 'bg-[#dae2fd]'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            )}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-[#3525cd]' : 'text-[#131b2e]'
                            }`}
                          >
                            {option.text}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#3525cd]' : 'text-[#464555]'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </button>
                  );
                })}

                <div className="flex items-center justify-between text-[#464555] text-[11px] px-1">
                  <span>{post.poll.totalVotes} votos totales • {post.poll.timeLeft}</span>
                  <span className="text-[#712ae2] font-bold">Encuesta activa</span>
                </div>
              </div>
            )}

            {/* Event Header & Banner */}
            {post.event && (
              <div className="rounded-xl overflow-hidden border border-[#eaedff] flex flex-col">
                <div className="relative w-full h-44 bg-[#eaedff]">
                  <img
                    alt={post.event.title}
                    className="w-full h-full object-cover"
                    src={post.event.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/90 via-[#283044]/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#712ae2] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[14px]">local_activity</span>
                    <span>EVENTO CAMPUS</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-[#eef0ff]">
                    <span className="text-[10px] text-[#6ffbbe] font-bold tracking-wide uppercase">
                      {post.event.category}
                    </span>
                    <h2 className="text-lg font-bold leading-tight text-white">
                      {post.event.title}
                    </h2>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col gap-3 bg-white">
                  {/* Event Details Info */}
                  <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2.5 rounded-xl border border-[#e2e7ff]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#3525cd] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#464555] font-bold">Fecha</span>
                        <span className="text-xs text-[#131b2e] font-semibold truncate">
                          {post.event.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#712ae2] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#464555] font-bold">Lugar</span>
                        <span className="text-xs text-[#131b2e] font-semibold truncate">
                          {post.event.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Interaction */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {post.event.attendeeAvatars.map((av, idx) => (
                          <div
                            key={idx}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden"
                          >
                            <img alt="attendee" className="w-full h-full object-cover" src={av} />
                          </div>
                        ))}
                      </div>
                      <span className="ml-2 text-[11px] text-[#464555] font-semibold">
                        +{post.event.attendeesCount} asistirán
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleEventRsvp(post.id)}
                      className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all ${
                        post.event.isAttending
                          ? 'bg-[#006e4b] text-white'
                          : 'bg-[#712ae2] text-white hover:bg-[#8a4cfc]'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {post.event.isAttending ? 'task_alt' : 'check_circle'}
                      </span>
                      <span>{post.event.isAttending ? 'Confirmado' : 'Asistiré'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-[#eaedff] text-[#3525cd] text-[10px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-[#f2f3ff]">
              <div className="flex items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                    post.isLiked ? 'text-[#ba1a1a]' : 'text-[#464555] hover:text-[#ba1a1a]'
                  }`}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                  <span>{post.likes}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setCommentOpenPostId(commentOpenPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#464555] hover:text-[#3525cd] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chat_bubble
                  </span>
                  <span>{post.comments}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Enlace copiado al portapapeles');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#464555] hover:text-[#712ae2] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  <span>{post.shares}</span>
                </button>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => onToggleSave(post.id)}
                className={`transition-colors active:scale-95 ${
                  post.isSaved ? 'text-[#3525cd]' : 'text-[#464555] hover:text-[#3525cd]'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    fontVariationSettings: post.isSaved ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  bookmark
                </span>
              </button>
            </div>

            {/* Inline Comment Box when open */}
            {commentOpenPostId === post.id && (
              <div className="pt-2 flex items-center gap-2 border-t border-[#f2f3ff] mt-1">
                <input
                  type="text"
                  placeholder="Escribe una respuesta académica..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-[#f2f3ff] px-3 py-2 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#3525cd]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCommentText.trim()) {
                      alert(`Comentario enviado: "${newCommentText}"`);
                      setNewCommentText('');
                      setCommentOpenPostId(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-bold"
                >
                  Enviar
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Floating Action Button (FAB) - Visible on mobile/tablet, desktop has sidebar action */}
      <div className="lg:hidden fixed bottom-20 md:bottom-8 right-4 z-40">
        <button
          onClick={() => onOpenCreatePost('text')}
          aria-label="Nueva publicación"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#3525cd] to-[#712ae2] text-white shadow-[0_8px_24px_-4px_rgba(79,70,229,0.45)] flex items-center justify-center active:scale-90 transition-transform duration-200 hover:brightness-110"
          type="button"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>
    </div>
  );
};
