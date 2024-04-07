<template>
  <main class="app">
    <section class="greeting">
      <h2 class="title">
        <!-- Feature 1 : Input field for user's name -->
        What's up, <input type="text" id="name" placeholder="Name here" v-model="name">
      </h2>
    </section>

    <section class="create-todo">
      <h3>CREATE A TODO</h3>

      <form id="new-todo-form" @submit.prevent="addTodo">
        <h4>What's on your todo list?</h4>
        <input 
          type="text" 
          name="content" 
          id="content" 
          placeholder="Type your Todo..."
          v-model="input_content" />
        <!-- Feature 2 : Todo categories : Buisiness, Important, Personal -->
        <h4>Pick a category</h4>
        <div class="options">
          <label>
            <input 
              type="radio" 
              name="category" 
              id="category1" 
              value="business"
              v-model="input_category" />
            <span class="bubble business"></span>
            <div>Business</div>
          </label>

          <label>
            <input 
              type="radio" 
              name="category" 
              id="category2" 
              value="important"
              v-model="input_category" />
            <span class="bubble important"></span>
            <div>Important</div>
          </label>

          <label>
            <input 
              type="radio" 
              name="category" 
              id="category3" 
              value="personal"
              v-model="input_category" />
            <span class="bubble personal"></span>
            <div>Personal</div>
          </label>

          
        </div>

        <input type="submit" value="Add todo" />
      </form>
    </section>

    <section class="todo-list">
      <h3>TODO LIST</h3>
      <!-- Feature 3 : Filter options for todo list : All, Completed, Pending -->
      <div class="filter-options">
        <label>
          <input type="radio" value="all" v-model="filter"> All
        </label>
        <label>
          <input type="radio" value="completed" v-model="filter"> Completed
        </label>
        <label>
          <input type="radio" value="pending" v-model="filter"> Pending
        </label>
      </div>

      <div class="list" id="todo-list">
        <!-- Feature 4 : Message when no todos are present -->
        <div v-if="filteredTodos.length === 0" class="no-todos-message">
          <p v-if="filter === 'all'">Your todo list is as clean as a whistle! Ready to fill it up? 🚀</p>
          <p v-else-if="filter === 'completed'">Let's turn those tasks into triumphs! 🎉</p>
          <p v-else>Nothing pending? Enjoy the calm before the storm! 🌊</p>
        </div>
        <div v-else>
          <div v-for="todo in filteredTodos" :key="todo.id" :class="`todo-item ${todo.done && 'done'}`">
            <!-- Feature 5 : Checkbox for marking todo as done & style : strikethrough -->
            <label>
              <input type="checkbox" v-model="todo.done" @change="updateTodoStatus(todo)" />
              <!-- Feature 6 : Icon representing todo category -->
              <span :class="`bubble ${todo.category}`"></span>
            </label>

            <div class="todo-content">
              <!-- Feature 7 : Input field for editing todo content -->
              <input type="text" v-model="todo.content" @change="updateTodoContent(todo)" />
              <!-- Feature 8 : Display creation date & last update date -->
              <div>Created At: {{ formatDate(todo.createdAt) }}</div>
              <div>Updated At: {{ formatDate(todo.updatedAt) }}</div>
            </div>

            <div class="actions">
              <!-- Feature 9 : Button to delete todo -->
              <button class="delete" @click="removeTodo(todo)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// Import required Vue functions and Firebase SDK functions
import { ref, onMounted, watch } from 'vue';
import { inject } from 'vue';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Inject Firestore instance provided by Vue app
const firestore = inject('firestore');

const todos = ref([]);
const name = ref('');
const input_content = ref('');
const input_category = ref(null);
const filter = ref('all');

watch(name, (newVal) => {
  localStorage.setItem('name', newVal);
});

const addTodo = async () => {
  if (input_content.value.trim() === '' || input_category.value === null) {
    return;
  }

  try {
    const now = new Date().getTime();
    // Add new todo to Firestore collection
    const docRef = await addDoc(collection(firestore, 'todos'), {
      content: input_content.value,
      category: input_category.value,
      done: false,
      createdAt: now,
      updatedAt: now
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

const removeTodo = async (todo) => {
  try {
    await deleteDoc(doc(firestore, 'todos', todo.id));
  } catch (e) {
    console.error('Error removing document: ', e);
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};


const filteredTodos = ref([]);

const applyFilter = () => {
  // Feature 10 : Filter todos and sort them by creation date
  if (filter.value === 'all') {
    filteredTodos.value = todos.value.slice().sort((a, b) => a.createdAt - b.createdAt);
  } else {
    filteredTodos.value = todos.value
      .filter(todo => todo.done === (filter.value === 'completed'))
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt);
  }
};

watch([todos, filter], applyFilter, { immediate: true });

onMounted(async () => {
  name.value = localStorage.getItem('name') || '';

  // Get Firestore collection of todos
  const todoCollection = collection(firestore, 'todos');
  // Subscribe to changes in todos collection
  const snapshot = await onSnapshot(todoCollection, (querySnapshot) => {
    todos.value = [];
    querySnapshot.forEach((doc) => {
      todos.value.push({ ...doc.data(), id: doc.id });
    });
    applyFilter();
  });
});

// Function to update todo status
const updateTodoStatus = async (todo) => {
  try {
    await updateDoc(doc(firestore, 'todos', todo.id), {
      done: todo.done,
      updatedAt: new Date().getTime()
    });
  } catch (e) {
    console.error('Error updating document: ', e);
  }
};

// Function to update todo content
const updateTodoContent = async (todo) => {
  try {
    await updateDoc(doc(firestore, 'todos', todo.id), {
      content: todo.content,
      updatedAt: new Date().getTime()
    });
  } catch (e) {
    console.error('Error updating document: ', e);
  }
};
</script>


