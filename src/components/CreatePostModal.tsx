import React, { useState } from 'react';
import { Post } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'text' | 'pdf' | 'poll' | 'photo';
  authorName: string;
  authorAvatar?: string;
  authorTag?: string;
  onAddPost: (newPost: Post) => void | Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  initialType = 'text',
  authorName,
  authorAvatar,
  authorTag,
  onAddPost,
}) => {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [hasPdf, setHasPdf] = useState(initialType === 'pdf');
  const [pdfName, setPdfName] = useState('');
  const [hasPoll, setHasPoll] = useState(initialType === 'poll');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorName,
      authorAvatar: authorAvatar || '',
      authorTag: authorTag || 'CampusLink',
      authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
      verified: false,
      timeAgo: 'Justo ahora',
      content: content.trim(),
      tags: tag.trim() ? [tag.trim()] : [],
      likes: 0,
      isLiked: false,
      comments: 0,
      shares: 0,
      isSaved: false,
      pdfAttachment: hasPdf
        ? {
            name: pdfName,
            size: '2.4 MB',
            downloads: 1,
            fileContent: '',
          }
        : undefined,
      poll: hasPoll
        ? {
            totalVotes: 0,
            timeLeft: 'Quedan 2 días',
            userVotedOption: undefined,
            options: [
              { id: 'o1', text: opt1, votes: 0, colorClass: 'bg-primary/15 text-primary' },
              { id: 'o2', text: opt2, votes: 0, colorClass: 'bg-primary/15 text-primary' },
            ],
          }
        : undefined,
    };

    setIsPublishing(true);
    setPublishError('');
    try {
      await onAddPost(newPost);
      setContent('');
      onClose();
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#eaedff] flex flex-col animate-in fade-in">
        {/* Header */}
        <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#3525cd]">
              edit_note
            </span>
            <h3 className="text-sm font-bold text-[#131b2e]">Crear Publicación</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            {authorAvatar ? (
              <img src={authorAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2dfff] text-sm font-bold text-[#3323cc]">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#131b2e]">{authorName}</span>
              <span className="text-[10px] text-[#3525cd] font-semibold">
                Visible para la comunidad
              </span>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="¿Qué quieres compartir hoy con tu comunidad universitaria? (Ej: Apuntes, dudas de materias, invitaciones...)"
            className="w-full p-3 bg-[#f2f3ff] rounded-2xl text-xs text-[#131b2e] outline-none focus:bg-white focus:ring-1 focus:ring-[#3525cd] resize-none"
            required
          />

          {/* Quick options to toggle PDF or Poll */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHasPdf(!hasPdf)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                hasPdf ? 'bg-[#3525cd] text-white' : 'bg-[#e2e7ff] text-[#464555]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>{hasPdf ? 'PDF Incluido' : '+ Adjuntar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setHasPoll(!hasPoll)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                hasPoll ? 'bg-[#712ae2] text-white' : 'bg-[#e2e7ff] text-[#464555]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">poll</span>
              <span>{hasPoll ? 'Encuesta Activa' : '+ Crear Encuesta'}</span>
            </button>
          </div>

          {/* PDF Details Input */}
          {hasPdf && (
            <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#e2e7ff] flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#464555]">
                Nombre del archivo PDF
              </label>
              <input
                type="text"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                className="bg-white p-2 rounded-lg text-xs text-[#131b2e] border border-[#eaedff] outline-none"
              />
            </div>
          )}

          {/* Poll Options Inputs */}
          {hasPoll && (
            <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#e2e7ff] flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#712ae2]">Opciones de la encuesta</label>
              <input
                type="text"
                value={opt1}
                onChange={(e) => setOpt1(e.target.value)}
                placeholder="Opción 1"
                className="bg-white p-2 rounded-lg text-xs text-[#131b2e] border border-[#eaedff] outline-none"
              />
              <input
                type="text"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                placeholder="Opción 2"
                className="bg-white p-2 rounded-lg text-xs text-[#131b2e] border border-[#eaedff] outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#f2f3ff]">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-[#eaedff] text-[#3525cd] text-xs font-bold px-2.5 py-1.5 rounded-lg outline-none"
            >
                <option value="">Sin etiqueta</option>
                <option value="#Ingeniería">#Ingeniería</option>
              <option value="#Medicina">#Medicina</option>
              <option value="#Examenes">#Examenes</option>
              <option value="#Tutorias">#Tutorias</option>
              <option value="#Eventos">#Eventos</option>
            </select>

            <button
              type="submit"
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#4f46e5] active:scale-95 transition-transform"
            >
              {isPublishing ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
          {publishError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{publishError}</p>}
        </form>
      </div>
    </div>
  );
};
