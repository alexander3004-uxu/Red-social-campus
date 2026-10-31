import { db } from '../db.js';

export async function listPeople(req, res) {
  try {
    const people = await db.searchPeople(req.query.q || '', req.user.id);
    return res.json({ success: true, people });
  } catch (error) {
    console.error('[Social] Error buscando personas:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron cargar las personas.' });
  }
}

export async function followPerson(req, res) {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.userId)) {
      return res.status(404).json({ success: false, code: 'PERSON_NOT_FOUND', message: 'No encontramos esa cuenta.' });
    }
    const result = await db.followPerson(req.user.id, req.params.userId);
    return res.json({ success: true, ...result });
  } catch (error) {
    const status = error.code === 'PERSON_NOT_FOUND' ? 404 : error.code === 'INVALID_FOLLOW' ? 400 : 500;
    if (status === 500) console.error('[Social] Error siguiendo cuenta:', error);
    return res.status(status).json({ success: false, code: error.code, message: error.message || 'No se pudo seguir la cuenta.' });
  }
}

export async function unfollowPerson(req, res) {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.userId)) {
      return res.status(404).json({ success: false, code: 'PERSON_NOT_FOUND', message: 'No encontramos esa cuenta.' });
    }
    const result = await db.unfollowPerson(req.user.id, req.params.userId);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Social] Error dejando de seguir cuenta:', error);
    return res.status(500).json({ success: false, message: 'No se pudo dejar de seguir la cuenta.' });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const { userId } = req.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return res.status(404).json({ success: false, code: 'PERSON_NOT_FOUND', message: 'No encontramos esa cuenta.' });
    }
    const result = await db.sendFriendRequest(req.user.id, userId);
    return res.json({ success: true, request: result });
  } catch (error) {
    const status = error.code === 'INVALID_REQUEST' ? 400 : 500;
    return res.status(status).json({ success: false, message: error.message || 'No se pudo enviar la solicitud.' });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const result = await db.acceptFriendRequest(requestId, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'No se encontró la solicitud de amistad.' });
    }
    return res.json({ success: true, request: result });
  } catch (error) {
    console.error('[Social] Error aceptando solicitud:', error);
    return res.status(500).json({ success: false, message: 'No se pudo aceptar la solicitud.' });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const result = await db.rejectFriendRequest(requestId, req.user.id);
    return res.json({ success: true, request: result });
  } catch (error) {
    console.error('[Social] Error rechazando solicitud:', error);
    return res.status(500).json({ success: false, message: 'No se pudo rechazar la solicitud.' });
  }
}

export async function cancelFriendRequest(req, res) {
  try {
    const { userId } = req.params;
    const deleted = await db.cancelFriendRequest(req.user.id, userId);
    return res.json({ success: true, cancelled: deleted });
  } catch (error) {
    console.error('[Social] Error cancelando solicitud:', error);
    return res.status(500).json({ success: false, message: 'No se pudo cancelar la solicitud.' });
  }
}

export async function removeFriend(req, res) {
  try {
    const { userId } = req.params;
    await db.removeFriend(req.user.id, userId);
    return res.json({ success: true, removed: true });
  } catch (error) {
    console.error('[Social] Error eliminando amistad:', error);
    return res.status(500).json({ success: false, message: 'No se pudo eliminar la amistad.' });
  }
}

export async function listPosts(req, res) {
  try {
    const posts = await db.listCampusPosts(req.user.id);
    return res.json({ success: true, posts });
  } catch (error) {
    console.error('[Social] Error cargando publicaciones:', error);
    return res.status(500).json({ success: false, message: 'No se pudieron cargar las publicaciones.' });
  }
}

export async function setPostLike(req, res) {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.postId)) {
      return res.status(404).json({ success: false, message: 'No encontramos esa publicación.' });
    }
    if (typeof req.body.liked !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Indica si deseas dar o quitar el me gusta.' });
    }
    const likes = await db.setCampusPostLike(req.user.id, req.params.postId, req.body.liked);
    if (likes === null) return res.status(404).json({ success: false, message: 'No encontramos esa publicación.' });
    return res.json({ success: true, likes, isLiked: req.body.liked });
  } catch (error) {
    console.error('[Social] Error actualizando me gusta:', error);
    return res.status(500).json({ success: false, message: 'No se pudo actualizar el me gusta.' });
  }
}

export async function createPost(req, res) {
  try {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > 5000) {
      return res.status(400).json({ success: false, message: 'La publicación debe tener texto y no superar 5,000 caracteres.' });
    }

    const postData = {
      content,
      tags: Array.isArray(req.body.tags) ? req.body.tags.filter((tag) => typeof tag === 'string').slice(0, 10) : [],
      pdfAttachment: req.body.pdfAttachment && typeof req.body.pdfAttachment === 'object' ? req.body.pdfAttachment : null,
      poll: req.body.poll && typeof req.body.poll === 'object' ? req.body.poll : null,
      event: req.body.event && typeof req.body.event === 'object' ? req.body.event : null,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
    };

    const post = await db.createCampusPost(req.user.id, postData);
    return res.status(201).json({ success: true, post });
  } catch (error) {
    const status = error.code === 'PROFILE_INCOMPLETE' ? 403 : 500;
    if (status === 500) console.error('[Social] Error creando publicación:', error);
    return res.status(status).json({ success: false, code: error.code, message: error.message || 'No se pudo publicar.' });
  }
}
