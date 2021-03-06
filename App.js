import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@toDoMode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setTodos] = useState({});
  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify({ working: false }));
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify({ working: true }));
  };
  const onChangeText = (payload) => setText(payload);
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s === null) {
      setTodos({});
    } else {
      try {
        setTodos(JSON.parse(s));
      } catch (e) {}
    }
  };
  const loadMode = async () => {
    const s = await AsyncStorage.getItem(MODE_KEY);
    if (s === null) {
      setWorking(true);
      return;
    }
    try {
      const mode = JSON.parse(s);
      setWorking(mode.working);
    } catch (e) {}
  };
  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...toDos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const deleteTodo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To do ?");
      if (ok) {
        const newTodos = { ...toDos };
        delete newTodos[key];
        setTodos(newTodos);
        await saveTodos(newTodos);
      }
    } else {
      Alert.alert("Delete To Do ?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "OK",
          onPress: async () => {
            const newTodos = { ...toDos };
            delete newTodos[key];
            setTodos(newTodos);
            await saveTodos(newTodos);
          },
        },
      ]);
    }
  };

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto"></StatusBar>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: "white",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: "white",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          returnKeyType="done"
          onSubmitEditing={addTodo}
          onChangeText={onChangeText}
          value={text}
          placeholder={working ? "Add ad To Do" : "Where do you want to go?"}
          style={styles.input}
        ></TextInput>
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <Text style={styles.todoText}>{toDos[key].text}</Text>
                <TouchableOpacity onPress={() => deleteTodo(key)}>
                  <Fontisto name="trash" size={20} color="white"></Fontisto>
                </TouchableOpacity>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    marginVertical: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.todoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
