import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Button,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import SERVER_ADDRESS from "@/constants/Connection";

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function AudioRecorderPlayerComponent() {
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState("00:00");
  const [recordedFile, setRecordedFile] = useState("");
  const [playing, setPlaying] = useState(false);
  const [playTime, setPlayTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [transcription, setTranscription] = useState("");

  const hasPermission = useRef(false);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      hasPermission.current =
        granted["android.permission.RECORD_AUDIO"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED;
    } else {
      hasPermission.current = true;
    }
  };

  const transcribeAudio = async () => {
    const formData = new FormData();
    formData.append("audio", recordedFile);

    try {
      const response = await fetch(SERVER_ADDRESS + "/transcribe_audio", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      console.log("Upload success:", json);

      return json["transcription"];
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const onStartRecord = async () => {
    await requestPermissions();
    if (!hasPermission.current) return;

    const path = Platform.select({
      ios: "recording.m4a",
      android: undefined, // default path on Android
    });

    const uri = await audioRecorderPlayer.startRecorder(path);
    setRecordedFile(uri);
    setRecording(true);

    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
    });
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecording(false);
    setRecordTime("00:00");
    console.log("Recorded file:", result);
    setTranscription(await transcribeAudio());
  };

  const onStartPlay = async () => {
    if (!recordedFile) return;

    const msg = await audioRecorderPlayer.startPlayer(recordedFile);
    setPlaying(true);
    audioRecorderPlayer.addPlayBackListener((e) => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      if (e.currentPosition >= e.duration) {
        onStopPlay();
      }
    });
  };

  const onStopPlay = async () => {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setPlaying(false);
    setPlayTime("00:00");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎙️ Audio Recorder & Player</Text>

      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? onStopRecord : onStartRecord}
      />
      <Text style={styles.timer}>Recording Time: {recordTime}</Text>

      <View style={styles.divider} />

      <Button
        title={playing ? "Stop Playback" : "Play Recording"}
        onPress={playing ? onStopPlay : onStartPlay}
        disabled={!recordedFile}
      />
      <Text style={styles.timer}>
        Playback: {playTime} / {duration}
      </Text>
      <Button
        title={"Transcribe"}
        onPress={async (e) => {
          await transcribeAudio();
        }}
        disabled={!recordedFile}
      />
      <Text>{transcription}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "600",
  },
  timer: {
    marginTop: 10,
    fontSize: 16,
  },
  divider: {
    marginVertical: 20,
    borderBottomWidth: 1,
    width: "80%",
    borderColor: "#ccc",
  },
});
