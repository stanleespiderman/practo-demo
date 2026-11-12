package com.example.practodemo

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import java.io.OutputStream

/** Visible demo banner and footer repeat on every page, including long documents. */
fun writeDemoPdf(output: OutputStream, doc: MedicalDocument, doctor: Doctor, patient: Patient) {
    val pdf = PdfDocument()
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    var number = 0
    var y = 100f
    fun newPage(): PdfDocument.Page {
        number++
        val p = pdf.startPage(PdfDocument.PageInfo.Builder(595, 842, number).create())
        paint.color = Color.rgb(255, 241, 219)
        p.canvas.drawRect(30f, 25f, 565f, 60f, paint)
        paint.color = Color.rgb(158, 111, 40)
        paint.textSize = 12f
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        p.canvas.drawText("DEMO - NOT VALID FOR MEDICAL USE", 48f, 47f, paint)
        paint.textSize = 9f
        p.canvas.drawText(
            "SIMULATED DOCUMENT - NO SIGNATURE - NO CLINICAL VALIDITY | Page $number",
            35f,
            815f,
            paint,
        )
        return p
    }
    var page = newPage()
    fun text(value: String, size: Float = 11f, bold: Boolean = false) {
        paint.typeface =
            Typeface.create(Typeface.DEFAULT, if (bold) Typeface.BOLD else Typeface.NORMAL)
        paint.textSize = size
        paint.color = Color.rgb(52, 63, 85)
        val paragraphs = value.split('\n')
        for (paragraph in paragraphs) {
            var remaining = paragraph.ifBlank { " " }
            while (remaining.isNotEmpty()) {
                var count = paint.breakText(remaining, true, 510f, null).coerceAtLeast(1)
                if (count < remaining.length) {
                    val split = remaining.lastIndexOf(' ', count)
                    if (split > 0) count = split
                }
                if (y > 780) {
                    pdf.finishPage(page)
                    page = newPage()
                    y = 90f
                    paint.typeface =
                        Typeface.create(
                            Typeface.DEFAULT,
                            if (bold) Typeface.BOLD else Typeface.NORMAL,
                        )
                    paint.textSize = size
                    paint.color = Color.rgb(52, 63, 85)
                }
                page.canvas.drawText(remaining.take(count), 40f, y, paint)
                remaining = remaining.drop(count).trimStart()
                y += size + 6f
            }
        }
        y += 7f
    }
    try {
        text(doc.title, 20f, true)
        text("${doc.type} | ${doc.id}", 10f)
        text("Fictional patient: ${patient.name}, ${patient.age} years, ${patient.gender}")
        text("Fictional doctor: ${doctor.name} | ${doctor.specialty}")
        text("Consultation: ${doc.consultationId}")
        doc.fields().forEach { (title, value) ->
            text(title, 12f, true)
            text(value)
        }
        text(
            "This fictional document is a software demo. It is not valid for medical, administrative, employment or insurance use. No real signature or registration number is included.",
            10f,
            true,
        )
        pdf.finishPage(page)
        pdf.writeTo(output)
    } finally {
        pdf.close()
    }
}
