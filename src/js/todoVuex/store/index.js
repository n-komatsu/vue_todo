import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    todos: [],
    todoFilter: '',
    targetTodo: {
      id: null,
      title: '',
      detail: '',
      completed: '',
    },
    errorMessage: '',
    emptyMessage: '',
  },
  getters: {
    completedTodos(state) {
      return state.todos.filter((todo) => {
        return todo.completed;
      })
    },
    incompleteTodos(state) {
      return state.todos.filter((todo) => {
        return !todo.completed;
      })
    },
    completedTodosLength(state, getters) {
      return getters.completedTodos.length;
    },
    incompleteTodosLength(state, getters) {
      return getters.incompleteTodos.length;
    },
    hasError(state, getters) {
      const hasErrorFlg = state.errorMessage.length === 0;
      return hasErrorFlg;
    },
    checkEmptyTodos(state, getters) {
      const TodosEmptyFlg = state.emptyMessage.length === 0; 
      return TodosEmptyFlg;
    }
  },
  mutations: {
    setTodoFilter(state, routeName) {
      state.todoFilter = routeName;
    },
    setEmptyMessage(state, routeName) {
      if (routeName === 'completedTodos') {
        let emptyMessage = '完了済みのやることリストはありません。';
      } else if (routeName === 'incompleteTodos') {
        let emptyMessage = '未完了のやることリストはありません。';
      } else {
        let emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo(state) {
      state.targetTodo = {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError(state) {
      state.errorMessage = 'エラーが起きました。';
    },
    showError(state, payload) {
      if (payload.err) {
        console.log(payload.err);
        const errorMessage = payload.err.data;
      } else {
        state.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    updateTargetTodo(state, { name, value }) {
      state.targetTodo[name] = value;
    },
    getTodos(state, payload) {
      state.todos = payload.reverse();
    },
    addTodo(state, payload) {
      state.todos.unshift(payload);
    },
    showEditor(state, payload) {
      state.targetTodo = Object.assign({}, payload);
    },
    editTodo(state, payload) {
      state.todos = state.todos.map((todoItem) => {
        if (todoItem.id === payload.id) return payload;
        return todoItem;
      });
    },
    deleteTodo(state, payload) {
      state.todos = payload.todos.reverse();
    }
  },
  actions: {
    setTodoFilter({ commit }, routeName) {
      commit('setTodoFilter', routeName);
    },
    setEmptyMessage({ commit }, routeName) {
      commit('setEmptyMessage', routeName);
    },
    updateTargetTodo({ commit }, { name, value }) {
      commit('updateTargetTodo', { name, value });
    },
    getTodos({ commit }) {
      axios.get('http://localhost:3000/api/todos/').then(function({ data }) {
        commit('getTodos', data.todos);
      }).catch(function(err) {
        const payload = {
          err: err.response,
        }
        commit('showError', payload);
      });
    },
    addTodo({ commit, state }) {
      if (!state.targetTodo.title || !state.targetTodo.detail) {
        commit({
          type: 'showError',
          data: 'タイトルと内容はどちらも必須項目です。',
        });
        return;
      }
      const postTodo = Object.assign({}, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo).then(function({ data }) {
        commit('addTodo', data);
      }).catch(function(err) {
        const payload = {
          err: err.response,
        }
        commit('showError', payload);
      });
      commit('initTargetTodo');
    },
    changeCompleted({ commit }, payload) {
      const targetTodo = Object.assign({}, payload);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      }).then(function({ data }) {
        commit('editTodo', data);
      }).catch(function(err) {
        const payload = {
          err: err.response,
        }
        commit('showError', payload);
      });
      commit('initTargetTodo');
    },
    showEditor({ commit }, payload) {
      commit('showEditor', payload);
    },
    editTodo({ commit, state }) {
      const targetTodo = state.todos.find(todo => todo.id === state.targetTodo.id);
      if (
        targetTodo.title === state.targetTodo.title
        && targetTodo.detail === state.targetTodo.detail
      ) {
        commit('initTargetTodo');
        return;
      }
      axios.patch(`http://localhost:3000/api/todos/${state.targetTodo.id}`, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      }).then(function({ data }) {
        commit('editTodo', data);
      }).catch(function(err) {
        const payload = {
          err: err.response,
        }
        commit('showError', payload);
      });
      commit('initTargetTodo');
    },
    deleteTodo({ commit,state }, todo) {
      axios.delete(`http://localhost:3000/api/todos/${todo.id}`).then(function({ data }) {
        // 処理
        const payload = {
          todos: data.todos,
        };
        commit('deleteTodo', payload);
      }).catch(function(err) {
        // 処理
        const payload = {
          err: err.response,
        }
        commit('showError', payload);
      });
      // 必要があれば処理
      commit('initTargetTodo');
    },
  },
});

export default store;
