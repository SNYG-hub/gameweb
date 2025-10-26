import { createRouter, createWebHistory } from 'vue-router';
import GameList from '../components/GameList.vue';
import GameForm from '../components/GameForm.vue';
import GameDetail from '../components/GameDetail.vue';
import Forum from '../components/Forum.vue';
import PostForm from '../components/PostForm.vue';
import PostDetail from '../components/PostDetail.vue';
import Rank from '../components/Rank.vue';
import Auth from '../components/Auth.vue';
import ResetPassword from '../components/ResetPassword.vue';
import Profile from '../components/Profile.vue';
import Following from '../components/Following.vue';
import Followers from '../components/Followers.vue';
import Messages from '../components/Messages.vue';
import Moderation from '../components/Moderation.vue';

const routes = [
  { path: '/', name: 'home', component: GameList },
  { path: '/add', name: 'add-game', component: GameForm },
  { path: '/game/:id', name: 'game-detail', component: GameDetail, props: true },
  { path: '/forum', name: 'forum', component: Forum },
  { path: '/forum/new', name: 'post-new', component: PostForm },
  { path: '/forum/post/:id', name: 'post-detail', component: PostDetail, props: true },
  { path: '/rank', name: 'rank', component: Rank },
  { path: '/auth', name: 'auth', component: Auth },
  { path: '/reset-password', name: 'reset-password', component: ResetPassword },
  { path: '/profile', name: 'profile', component: Profile },
  { path: '/profile/following', name: 'profile-following', component: Following },
  { path: '/profile/followers', name: 'profile-followers', component: Followers },
  { path: '/messages', name: 'messages', component: Messages },
  { path: '/moderation', name: 'moderation', component: Moderation },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;