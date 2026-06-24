import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../theme';

async function lookupBarcode(barcode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, { signal: controller.signal });
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    const cal = p.nutriments?.['energy-kcal_100g'];
    if (!cal) return null;
    return {
      name: p.product_name_he || p.product_name || 'מוצר',
      calories: Math.round(cal),
      protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default function BarcodeScanModal({ visible, onClose, onAddFood }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState('scan');
  const [product, setProduct] = useState(null);
  const [grams, setGrams] = useState('100');
  const scanning = useRef(false);

  async function handleBarcode({ data: barcode }) {
    if (scanning.current) return;
    scanning.current = true;
    setStep('loading');
    try {
      const found = await lookupBarcode(barcode);
      if (!found) { setStep('notfound'); return; }
      setProduct(found);
      setGrams('100');
      setStep('result');
    } catch {
      Alert.alert('שגיאה', 'לא הצלחנו לחפש את המוצר — בדוק חיבור אינטרנט');
      rescan();
    }
  }

  function rescan() {
    scanning.current = false;
    setStep('scan');
    setProduct(null);
  }

  function confirm() {
    const g = Number(grams);
    if (!g || g <= 0) return Alert.alert('שגיאה', 'נא להכניס כמות תקינה');
    onAddFood({
      name: product.name,
      calories: Math.round((product.calories / 100) * g),
      protein: Math.round((product.protein / 100) * g * 10) / 10,
      grams: g,
    });
    handleClose();
  }

  function handleClose() { rescan(); onClose(); }

  if (!visible) return null;

  if (!permission?.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={s.overlay}>
          <View style={s.card}>
            <Text style={s.title}>📷 גישה למצלמה</Text>
            <Text style={s.sub}>נדרשת הרשאה לסריקת ברקוד</Text>
            <TouchableOpacity style={s.mainBtn} onPress={requestPermission}>
              <Text style={s.mainBtnTxt}>אשר גישה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Text style={s.closeTxt}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>

        {step === 'scan' && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={s.scanOverlay}>
              <View style={s.scanFrame}>
                <View style={[s.corner, s.tl]} />
                <View style={[s.corner, s.tr]} />
                <View style={[s.corner, s.bl]} />
                <View style={[s.corner, s.br]} />
              </View>
              <Text style={s.scanHint}>כוון לברקוד של המוצר</Text>
            </View>
            <TouchableOpacity style={s.topClose} onPress={handleClose}>
              <Text style={s.topCloseTxt}>✕ סגור</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'loading' && (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={s.sub}>מחפש מוצר...</Text>
          </View>
        )}

        {step === 'notfound' && (
          <View style={s.centerBox}>
            <View style={s.card}>
              <Text style={s.title}>😕 מוצר לא נמצא</Text>
              <Text style={s.sub}>המוצר לא קיים במאגר{'\n'}נסה לסרוק שוב או הוסף ידנית</Text>
              <TouchableOpacity style={s.mainBtn} onPress={rescan}>
                <Text style={s.mainBtnTxt}>סרוק שוב</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
                <Text style={s.closeTxt}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'result' && product && (
          <View style={s.centerBox}>
            <View style={s.card}>
              <Text style={s.title}>{product.name}</Text>
              <Text style={s.sub}>לכל 100g: {product.calories} קל' · {product.protein}g חלבון</Text>
              <TextInput
                style={s.gramsInput}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={[s.sub, { marginBottom: 10 }]}>גרמים</Text>
              {grams && !isNaN(grams) && Number(grams) > 0 && (
                <View style={s.resultBox}>
                  <Text style={s.resultText}>🔥 {Math.round((product.calories / 100) * Number(grams))} קלוריות</Text>
                  <Text style={s.resultText}>💪 {Math.round((product.protein / 100) * Number(grams) * 10) / 10}g חלבון</Text>
                </View>
              )}
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.closeBtn, { flex: 1 }]} onPress={rescan}>
                  <Text style={s.closeTxt}>סרוק שוב</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.mainBtn, { flex: 1, marginTop: 0, marginBottom: 0 }]} onPress={confirm}>
                  <Text style={s.mainBtnTxt}>הוסף ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </View>
    </Modal>
  );
}

const FRAME = 240;
const CORNER = 24;
const THICK = 4;

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: colors.cardBorder },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: colors.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 4 },
  mainBtn: { backgroundColor: colors.teal, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  mainBtnTxt: { color: colors.bg, fontWeight: 'bold', fontSize: 16 },
  closeBtn: { padding: 14, alignItems: 'center' },
  closeTxt: { color: colors.subtext, fontSize: 15 },
  gramsInput: { fontSize: 48, fontWeight: 'bold', color: colors.teal, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: colors.teal, marginBottom: 4, paddingBottom: 4, marginTop: 12 },
  resultBox: { backgroundColor: colors.tealGlow, borderRadius: 12, padding: 14, marginBottom: 12, gap: 6, borderWidth: 1, borderColor: colors.tealDim },
  resultText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 24 },
  scanFrame: { width: FRAME, height: FRAME / 2, position: 'relative' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.teal },
  tl: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: 4 },
  scanHint: { color: '#fff', fontSize: 15, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  topClose: { position: 'absolute', top: 56, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  topCloseTxt: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
