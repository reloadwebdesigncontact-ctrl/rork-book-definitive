import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Image as ImageIcon, Loader2 } from "lucide-react-native";
import React, { useState, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ScanScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const frameOpacity = useRef(new Animated.Value(0)).current;
  const corner1 = useRef(new Animated.Value(0)).current;
  const corner2 = useRef(new Animated.Value(0)).current;
  const corner3 = useRef(new Animated.Value(0)).current;
  const corner4 = useRef(new Animated.Value(0)).current;
  const galleryScale = useRef(new Animated.Value(1)).current;
  const framePulse = useRef(new Animated.Value(1)).current;
  const captureButtonGlow = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    Animated.parallel([
      Animated.timing(frameOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        Animated.spring(corner1, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.spring(corner2, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.spring(corner3, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.spring(corner4, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
      ]),
    ]).start();

    const framePulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(framePulse, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(framePulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    framePulseAnim.start();

    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(captureButtonGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(captureButtonGlow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnim.start();

    return () => {
      pulse.stop();
      framePulseAnim.stop();
      glowAnim.stop();
    };
  }, [pulseAnim, frameOpacity, corner1, corner2, corner3, corner4, framePulse, captureButtonGlow]);

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    console.log("Processing image:", uri);
    
    setTimeout(() => {
      setIsProcessing(false);
      router.push({
        pathname: "/summary",
        params: { imageUri: uri },
      });
    }, 1500);
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo?.uri) {
          await processImage(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert(t.scan.error, "Impossible de prendre la photo");
      }
    }
  };

  const pickImage = async () => {
    if (isProcessing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t.scan.error, "Impossible de sélectionner l'image");
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Loader2 size={32} color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        {isDarkMode ? (
          <Image
            source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={["#FFF8F0", "#F5EBE0"]}
            style={styles.gradient}
          />
        )}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.permissionContainer}>
            <Camera size={64} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.permissionTitle, isDarkMode && styles.permissionTitleDark]}>
              {t.scan.title}
            </Text>
            <Text style={[styles.permissionText, isDarkMode && styles.permissionTextDark]}>
              Pour scanner les couvertures de livres, nous avons besoin
              d&apos;accéder à votre caméra.
            </Text>
            <Pressable onPress={requestPermission} style={styles.permissionButton}>
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Autoriser</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={"back" as CameraType}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <View style={styles.iconButton}>
                  <ArrowLeft size={24} color="#FFF" strokeWidth={2.5} />
                </View>
              </Pressable>
              <Text style={styles.topBarText}>Cadrez la couverture</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.centerContainer}>
              <Animated.View style={[styles.frame, { opacity: frameOpacity, transform: [{ scale: framePulse }] }]}>
                <Animated.View style={[styles.corner, styles.topLeft, { opacity: corner1, transform: [{ scale: corner1 }] }]} />
                <Animated.View style={[styles.corner, styles.topRight, { opacity: corner2, transform: [{ scale: corner2 }] }]} />
                <Animated.View style={[styles.corner, styles.bottomLeft, { opacity: corner3, transform: [{ scale: corner3 }] }]} />
                <Animated.View style={[styles.corner, styles.bottomRight, { opacity: corner4, transform: [{ scale: corner4 }] }]} />
              </Animated.View>
              <Animated.Text style={[styles.instruction, { opacity: frameOpacity }]}>
                Placez la couverture dans le cadre
              </Animated.Text>
            </View>

            <View style={styles.bottomBar}>
              <Animated.View style={{ transform: [{ scale: galleryScale }] }}>
                <Pressable 
                  onPress={pickImage} 
                  style={styles.galleryButton}
                  onPressIn={() => {
                    Animated.spring(galleryScale, {
                      toValue: 0.9,
                      useNativeDriver: true,
                    }).start();
                  }}
                  onPressOut={() => {
                    Animated.spring(galleryScale, {
                      toValue: 1,
                      friction: 3,
                      tension: 40,
                      useNativeDriver: true,
                    }).start();
                  }}
                >
                  <View style={styles.iconButton}>
                    <ImageIcon size={28} color="#FFF" strokeWidth={2} />
                  </View>
                </Pressable>
              </Animated.View>

              {isProcessing ? (
                <View style={styles.captureButton}>
                  <View style={[styles.captureButtonInner, { backgroundColor: colors.primary }]}>
                    <Loader2 size={32} color="#FFF" />
                  </View>
                </View>
              ) : (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Pressable onPress={takePicture} style={styles.captureButton}>
                    <Animated.View style={[styles.captureButtonGlow, { opacity: captureButtonGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }]} />
                    <View style={[styles.captureButtonInner, { backgroundColor: colors.primary }]}>
                      <Camera size={32} color="#FFF" strokeWidth={2.5} />
                    </View>
                  </Pressable>
                </Animated.View>
              )}

              <View style={{ width: 56 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  permissionTitleDark: {
    color: "#FFF",
  },
  permissionText: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 24,
  },
  permissionTextDark: {
    color: "#E0E0E0",
  },
  permissionButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topBarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  backButton: {
    width: 40,
    height: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 240,
    height: 320,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFF",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instruction: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
    marginTop: 24,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  galleryButton: {
    width: 56,
    height: 56,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  captureButtonGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
});
