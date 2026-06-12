/**
 * Knowledge Base Content — เนื้อหาความรู้สำหรับ CFO Web App
 * 8 หมวด + Tooltips + FAQ + คำอธิบาย KPI
 */

export const KNOWLEDGE_MODULES = [
  {
    id: 'cfo-basics',
    icon: '🌱',
    title: 'CFO คืออะไร?',
    tag: 'Beginner',
    tagColor: '#16a34a',
    summary: 'Carbon Footprint for Organization (CFO) คือ ปริมาณก๊าซเรือนกระจกที่ปล่อยจากกิจกรรมทั้งหมดขององค์กรในรอบ 1 ปี คำนวณตามมาตรฐาน GHG Protocol และได้รับการรับรองโดย อบก.',
    content: `
      <h3>ความหมาย</h3>
      <p>Carbon Footprint for Organization (CFO) หรือ "คาร์บอนฟุตพริ้นท์ขององค์กร" คือ การคำนวณปริมาณก๊าซเรือนกระจกที่ปล่อยออกมาจากกิจกรรมต่างๆ ขององค์กร ไม่ว่าจะเป็นการใช้ไฟฟ้า การเดินรถ การใช้เชื้อเพลิง การกำจัดขยะ ฯลฯ ในรอบระยะเวลา 1 ปี</p>

      <h3>ทำไมต้องทำ CFO?</h3>
      <ul>
        <li><b>ข้อกำหนดทางกฎหมาย:</b> หลายประเทศเริ่มมีกฎหมายบังคับให้รายงานคาร์บอนฟุตพริ้นท์ (CBAM, CSRD)</li>
        <li><b>ความต้องการของตลาด:</b> คู่ค้าและนักลงทุนต้องการข้อมูล Carbon Footprint</li>
        <li><b>ลดต้นทุน:</b> เห็นจุดที่ใช้พลังงานสูง → ปรับปรุง → ลดค่าใช้จ่าย</li>
        <li><b>ภาพลักษณ์:</b> สร้างความเชื่อมั่นแก่ผู้บริโภคและสังคม</li>
        <li><b>Net Zero:</b> ก้าวแรกสู่การเป็นองค์กร Net Zero</li>
      </ul>

      <h3>CFO vs CFP ต่างกันอย่างไร?</h3>
      <table>
        <tr><th>CFO (Organization)</th><th>CFP (Product)</th></tr>
        <tr><td>วัดทั้งองค์กร</td><td>วัดเฉพาะผลิตภัณฑ์</td></tr>
        <tr><td>หน่วย: tCO₂e/ปี</td><td>หน่วย: kgCO₂e/หน่วย</td></tr>
        <tr><td>ใช้ขอรับรอง อบก. (องค์กร)</td><td>ใช้ติดฉลากคาร์บอนผลิตภัณฑ์</td></tr>
      </table>

      <h3>มาตรฐานอ้างอิง</h3>
      <p>ระบบ CFO นี้ใช้มาตรฐาน:<br>
      • GHG Protocol Corporate Standard<br>
      • อบก. (TGO) CFO Guidelines<br>
      • IPCC 2006 Guidelines<br>
      • Emission Factors: TGO AR5 V2</p>
    `,
    faq: [
      { q: 'CFO ต้องทำทุกปีไหม?', a: 'แนะนำให้ทำทุกปีเพื่อติดตามแนวโน้มและวัดผลการลด — แต่การขอรับรอง อบก. อาจทำทุก 2-3 ปี' },
      { q: 'ถ้าไม่มีข้อมูลบางส่วนจะทำอย่างไร?', a: 'ใช้ค่าประมาณการตามหลักวิชาการ (เช่น คำนวณจากค่าเฉลี่ย) พร้อมบันทึกสมมติฐานไว้ใน Assumption Log' },
      { q: 'ค่าใช้จ่ายในการขอรับรอง อบก. เท่าไหร่?', a: 'ขึ้นอยู่กับขนาดองค์กรและความซับซ้อน — เริ่มต้นประมาณ 50,000-200,000 บาท' },
    ],
  },
  {
    id: 'scopes',
    icon: '🔬',
    title: 'แหล่งปล่อยก๊าซ 3 Scope',
    tag: 'Beginner',
    tagColor: '#16a34a',
    summary: 'การปล่อยก๊าซเรือนกระจกขององค์กรแบ่งเป็น 3 ขอบเขต (Scope) ตาม GHG Protocol — Scope 1 ทางตรง, Scope 2 ทางอ้อมจากพลังงาน, Scope 3 อื่นๆ',
    content: `
      <h3>🔴 Scope 1: การปล่อยทางตรง (Direct Emissions)</h3>
      <p>การปล่อยที่เกิดจากแหล่งที่องค์กรเป็นเจ้าของหรือควบคุมโดยตรง</p>
      <ul>
        <li><b>Stationary Combustion:</b> การเผาไหม้ที่อยู่กับที่ — เครื่องกำเนิดไฟฟ้า หม้อต้ม เตาในกระบวนการผลิต</li>
        <li><b>Mobile Combustion:</b> ยานพาหนะขององค์กร — รถกระบะ รถบรรทุก 6 ล้อ รถจักรยานยนต์</li>
        <li><b>Fugitive Emissions:</b> การรั่วไหล — สารทำความเย็น ถังดับเพลิง CO₂</li>
        <li><b>Biogenic CO₂:</b> การเผาไหม้ชีวมวล (แยกจาก Scope 1 ตามข้อกำหนด อบก.)</li>
      </ul>

      <h3>🔵 Scope 2: การปล่อยทางอ้อมจากพลังงาน (Indirect Energy Emissions)</h3>
      <p>การปล่อยที่เกิดจากการซื้อพลังงานมาใช้ เช่น ไฟฟ้า ไอน้ำ ความร้อน</p>
      <ul>
        <li><b>Purchased Electricity:</b> ไฟฟ้าที่ซื้อจาก MEA/PEA — คำนวณจาก kWh × Emission Factor ของ Grid</li>
        <li>ถึงแม้ไม่ได้ผลิตเอง แต่การใช้งานไฟฟ้าทำให้เกิด CO₂ ที่โรงไฟฟ้า</li>
      </ul>

      <h3>🟢 Scope 3: การปล่อยทางอ้อมอื่นๆ (Other Indirect Emissions)</h3>
      <p>การปล่อยที่เกิดจากกิจกรรมอื่นในห่วงโซ่คุณค่า (value chain)</p>
      <ul>
        <li><b>Waste Generation:</b> ขยะที่องค์กรกำจัด — ยิ่งฝังกลบมาก ยิ่งปล่อยก๊าซมีเทน</li>
        <li><b>Wastewater:</b> น้ำเสียจากกิจกรรม — เกิดก๊าซมีเทนจากการย่อยสลาย</li>
        <li><i>สามารถเพิ่มเติมได้: การขนส่ง, การเดินทางของพนักงาน, การซื้อวัตถุดิบ</i></li>
      </ul>
    `,
  },
  {
    id: 'calculation',
    icon: '🧮',
    title: 'วิธีการคำนวณและสูตร',
    tag: 'Intermediate',
    tagColor: '#2563eb',
    summary: 'หลักการคำนวณ CFO คือ ปริมาณกิจกรรม (Activity Data) × Emission Factor (EF) = ปริมาณก๊าซเรือนกระจก (kgCO₂e)',
    content: `
      <h3>สูตรพื้นฐาน</h3>
      <div class="formula-box">
        <b>Activity Data × Emission Factor = kgCO₂e</b>
      </div>
      <p>• Activity Data = ข้อมูลกิจกรรม เช่น ลิตร, kWh, กก., กม.<br>
      • Emission Factor = ค่าสัมประสิทธิ์การปล่อยก๊าซ (kgCO₂e/หน่วย)<br>
      • ผลลัพธ์ = kgCO₂e (กิโลกรัมคาร์บอนไดออกไซด์เทียบเท่า)</p>

      <h3>ตัวอย่างการคำนวณ</h3>
      <table>
        <tr><th>กิจกรรม</th><th>ปริมาณ</th><th>EF</th><th>kgCO₂e</th><th>เทียบเท่า</th></tr>
        <tr><td>ใช้ดีเซล</td><td>100 ลิตร</td><td>2.6993</td><td>269.93</td><td>🌳 13 ต้น/ปี</td></tr>
        <tr><td>ใช้ไฟฟ้า</td><td>1,000 kWh</td><td>0.4999</td><td>499.90</td><td>🌳 25 ต้น/ปี</td></tr>
        <tr><td>ขยะฝังกลบ</td><td>100 กก.</td><td>0.45</td><td>45.00</td><td>🌳 2 ต้น/ปี</td></tr>
        <tr><td>R-410A รั่ว</td><td>1 กก.</td><td>2,088 (GWP)</td><td>2,088</td><td>🌳 104 ต้น/ปี</td></tr>
      </table>

      <h3>การแปลงหน่วย</h3>
      <p>• 1,000 kgCO₂e = 1 tCO₂e (ตัน)<br>
      • 1 tCO₂e ≈ ปลูกต้นไม้ 50 ต้น/ปี (ดูดซับ CO₂)<br>
      • 1 tCO₂e ≈ ขับรถยนต์เบนซิน 4,600 กม.<br>
      • 1 tCO₂e ≈ ใช้ไฟฟ้า 2,000 kWh</p>

      <h3>ค่า Emission Factor ที่ใช้</h3>
      <table>
        <tr><th>ประเภท</th><th>ค่า EF</th><th>หน่วย</th><th>แหล่งอ้างอิง</th></tr>
        <tr><td>ไฟฟ้า MEA/PEA</td><td>0.4999</td><td>kgCO₂e/kWh</td><td>กกพ. 2567</td></tr>
        <tr><td>ดีเซล</td><td>2.6993</td><td>kgCO₂e/L</td><td>IPCC 2006</td></tr>
        <tr><td>LPG</td><td>3.1133</td><td>kgCO₂e/kg</td><td>IPCC 2006</td></tr>
        <tr><td>เบนซิน</td><td>2.1866</td><td>kgCO₂e/L</td><td>IPCC 2006</td></tr>
        <tr><td>ขยะฝังกลบ</td><td>0.45</td><td>kgCO₂e/kg</td><td>TGO CFO</td></tr>
      </table>
    `,
  },
  {
    id: 'kpi-targets',
    icon: '🎯',
    title: 'KPI & เป้าหมาย',
    tag: 'Intermediate',
    tagColor: '#2563eb',
    summary: 'ตัวชี้วัดสำคัญสำหรับวัดผลการดำเนินงานด้าน Carbon Footprint พร้อมเป้าหมาย Net Zero',
    content: `
      <h3>KPI หลัก</h3>

      <h4>1. Total Carbon Footprint (tCO₂e/ปี)</h4>
      <p><b>ความหมาย:</b> ปริมาณก๊าซเรือนกระจกรวมที่องค์กรปล่อยใน 1 ปี<br>
      <b>สูตร:</b> Scope 1 + Scope 2 + Scope 3 (kgCO₂e → หาร 1000 → tCO₂e)<br>
      <b>เป้าหมาย:</b> ลดลงทุกปี สู่ Net Zero ในปี 2593 (2050)</p>

      <h4>2. Carbon Intensity (tCO₂e/ล้านบาท)</h4>
      <p><b>ความหมาย:</b> ปริมาณ Carbon ต่อมูลค่าทางเศรษฐกิจ — ยิ่งต่ำยิ่งมีประสิทธิภาพ<br>
      <b>สูตร:</b> Total tCO₂e ÷ รายได้รวม (ล้านบาท)<br>
      <b>เปรียบเทียบ:</b> ค่าเฉลี่ยอุตสาหกรรม ~XX tCO₂e/ล้านบาท</p>

      <h4>3. % ลดจากปีฐาน (Base Year Reduction)</h4>
      <p><b>ความหมาย:</b> วัดความก้าวหน้าลด Carbon เทียบกับปีฐาน (Default: 2561)<br>
      <b>สูตร:</b> ((Base Year Total - Current Total) ÷ Base Year Total) × 100%<br>
      <b>เป้าหมาย:</b> ลด 50% ภายใน 2573 (2030), Net Zero ใน 2593 (2050)</p>

      <h4>4. Scope 1 Proportion (%)</h4>
      <p><b>ความหมาย:</b> สัดส่วนการปล่อยทางตรง — ยิ่งสูง องค์กรยิ่งควบคุมได้เอง<br>
      <b>สูตร:</b> Scope 1 ÷ Total × 100%</p>

      <h4>5. Biogenic CO₂ (tCO₂e)</h4>
      <p><b>ความหมาย:</b> ปริมาณ CO₂ จากชีวมวล — แยกรายงาน (ไม่รวมใน Total)<br>
      <b>สำคัญ:</b> อบก. กำหนดให้แยกรายงาน — แสดงถึงการใช้พลังงานหมุนเวียน</p>

      <h4>6. Carbon Credit (tCO₂e)</h4>
      <p><b>ความหมาย:</b> การซื้อขายคาร์บอนเครดิตเพื่อชดเชยการปล่อย<br>
      <b>ราคาปัจจุบัน:</b> ~2,000-3,000 บาท/tCO₂e (FTIX)</p>

      <h3>🎯 เป้าหมายของฮิลล์คอฟฟ์</h3>
      <div class="timeline-mini">
        <div><b>ปีฐาน (Base Year):</b> 2561 (2018)</div>
        <div><b>ระยะสั้น:</b> ลด 50% ภายใน 2573 (2030)</div>
        <div><b>Net Zero:</b> ภายใน 2593 (2050)</div>
      </div>
    `,
  },
  {
    id: 'benefits',
    icon: '💰',
    title: 'ประโยชน์ที่ได้รับ',
    tag: 'Beginner',
    tagColor: '#16a34a',
    summary: 'การทำ CFO ไม่ใช่แค่การรายงาน แต่สร้างมูลค่าให้องค์กรทั้งทางตรง ทางอ้อม และต่อสังคม',
    content: `
      <h3>💰 ประโยชน์ทางตรง</h3>
      <p><b>ลดค่าใช้จ่ายพลังงาน:</b> การทำ CFO ทำให้เห็นจุดที่ใช้พลังงานสูง → ปรับปรุง → ค่าไฟ ค่าน้ำมันลดลง<br>
      <b>ลดของเสีย:</b> เห็นปริมาณขยะ → วางแผน Reduce/Reuse/Recycle<br>
      <b>Carbon Credit:</b> การลดที่ทำได้จริง สามารถขายเป็นคาร์บอนเครดิต สร้างรายได้เสริม</p>

      <h3>🏆 ประโยชน์ทางอ้อม</h3>
      <p><b>ภาพลักษณ์องค์กร:</b> ได้รับการรับรองจาก อบก. → สร้างความเชื่อมั่นแก่คู่ค้าและลูกค้า<br>
      <b>ความได้เปรียบทางการแข่งขัน:</b> ตลาดโลกให้ความสำคัญกับสินค้าคาร์บอนต่ำ<br>
      <b>รองรับข้อกำหนด:</b> CBAM (EU), CSRD — ข้อกำหนดที่ต้องรายงาน Carbon</p>

      <h3>🌍 ประโยชน์ต่อผู้มีส่วนได้เสีย</h3>
      <h4>👥 ผู้บริหาร</h4>
      <p>• ข้อมูลตัดสินใจเชิงกลยุทธ์ — เห็นแนวโน้ม วางแผนลด คำนวณ ROI<br>
      • ลดความเสี่ยงด้านกฎระเบียบในอนาคต<br>
      • เพิ่มมูลค่าองค์กร (Green Value)</p>

      <h4>🤝 ลูกค้า/คู่ค้า</h4>
      <p>• ผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม<br>
      • ตรวจสอบ Carbon Footprint ได้ (Transparency)<br>
      • รองรับข้อกำหนด CBAM</p>

      <h4>👨‍👩‍👧‍👧 พนักงาน</h4>
      <p>• ภูมิใจในองค์กรที่ใส่ใจสิ่งแวดล้อม<br>
      • มีส่วนร่วมในการลด Carbon (Green Culture)<br>
      • สภาพแวดล้อมการทำงานที่ดีขึ้น</p>

      <h4>🌏 สังคม/สิ่งแวดล้อม</h4>
      <p>• ลดผลกระทบ Climate Change<br>
      • สนับสนุนเป้าหมาย Net Zero ของประเทศไทย<br>
      • เป็นต้นแบบองค์กรยั่งยืน</p>
    `,
  },
  {
    id: 'standards',
    icon: '🏛️',
    title: 'มาตรฐานและความน่าเชื่อถือ',
    tag: 'Advanced',
    tagColor: '#7c3aed',
    summary: 'ระบบ CFO ของเราอ้างอิงมาตรฐานสากลและหน่วยงานที่ได้รับการยอมรับในระดับประเทศและนานาชาติ',
    content: `
      <h3>🏛️ หน่วยงานและมาตรฐานอ้างอิง</h3>

      <h4>1. อบก. — องค์การบริหารจัดการก๊าซเรือนกระจก (TGO)</h4>
      <p>เป็นหน่วยงานของรัฐ ภายใต้กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม<br>
      • รับรอง CFO (Carbon Footprint for Organization)<br>
      • รับรอง CFP (Carbon Footprint of Products)<br>
      • รับรอง T-VER (Thailand Voluntary Emission Reduction)<br>
      • ออกฉลากคาร์บอน (Carbon Reduction Label)</p>

      <h4>2. GHG Protocol Corporate Standard</h4>
      <p>มาตรฐานสากลที่พัฒนาโดย World Resources Institute (WRI) และ World Business Council for Sustainable Development (WBCSD)<br>
      • เป็นมาตรฐานที่ใช้กันทั่วโลก<br>
      • แบ่งการปล่อยเป็น Scope 1, 2, 3</p>

      <h4>3. IPCC — Intergovernmental Panel on Climate Change</h4>
      <p>คณะกรรมการระหว่างรัฐบาลว่าด้วยการเปลี่ยนแปลงสภาพภูมิอากาศ<br>
      • จัดทำแนวทางการคำนวณก๊าซเรือนกระจก<br>
      • AR5 = Assessment Report ครั้งที่ 5 (ปัจจุบันใช้)</p>

      <h4>4. ISO 14064-1</h4>
      <p>มาตรฐานสากลสำหรับการวัดและรายงานก๊าซเรือนกระจกระดับองค์กร<br>
      • ใช้สำหรับการทวนสอบ (Verification) โดยบุคคลที่สาม</p>

      <h4>5. T-VER — Thailand Voluntary Emission Reduction</h4>
      <p>โครงการลดก๊าซเรือนกระจกภาคสมัครใจของไทย<br>
      • การลด Carbon ที่ทำได้จริง สามารถขอรับรองเป็นเครดิต<br>
      • ซื้อขายได้ที่ FTIX (Carbon Exchange)</p>

      <h3>🔬 กระบวนการทวนสอบ (Verification)</h3>
      <p>ข้อมูล CFO ที่บันทึกในระบบนี้สามารถตรวจสอบโดยผู้ทวนสอบ (Verifier) ที่ได้รับการรับรองจาก อบก. ซึ่งจะตรวจ:<br>
      1. ความถูกต้องของ Activity Data (มีหลักฐานยืนยัน)<br>
      2. ความถูกต้องของ Emission Factor (อ้างอิงแหล่งที่มา)<br>
      3. ความถูกต้องของการคำนวณ<br>
      4. ความสม่ำเสมอของข้อมูลข้ามปี</p>
    `,
  },
  {
    id: 'netzero',
    icon: '🌍',
    title: 'Net Zero Roadmap',
    tag: 'Advanced',
    tagColor: '#7c3aed',
    summary: 'เส้นทางสู่องค์กร Net Zero — ตั้งแต่การวัดผล การลด การชดเชย ไปจนถึงการบรรลุเป้าหมาย',
    content: `
      <h3>🎯 เป้าหมายของฮิลล์คอฟฟ์</h3>
      <div class="card" style="background:#f0fdf4;padding:20px;border-radius:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="text-align:center;padding:16px;background:#fff;border-radius:12px">
            <div style="font-size:28px;font-weight:800;color:#1a5632">50%</div>
            <div style="font-size:13px;color:#6b7280">ลดลงจากปีฐาน 2561<br>ภายในปี 2573 (2030)</div>
          </div>
          <div style="text-align:center;padding:16px;background:#fff;border-radius:12px">
            <div style="font-size:28px;font-weight:800;color:#1a5632">100%</div>
            <div style="font-size:13px;color:#6b7280">Net Zero<br>ภายในปี 2593 (2050)</div>
          </div>
        </div>
      </div>

      <h3>📋 4 ขั้นตอนสู่ Net Zero</h3>
      <ol>
        <li><b>วัด (Measure):</b> ทำ CFO — เก็บข้อมูลทุกแหล่งปล่อย — กำหนดปีฐาน</li>
        <li><b>วิเคราะห์ (Analyze):</b> หาจุดที่ลดได้ง่ายที่สุด — ดูแนวโน้ม — ตั้งเป้าหมาย</li>
        <li><b>ลด (Reduce):</b> เปลี่ยนรถ EV — Solar Roof — LED — ลดขยะ — เพิ่มชีวมวล</li>
        <li><b>ชดเชย (Offset):</b> ซื้อ Carbon Credit สำหรับส่วนที่ลดไม่ได้ — T-VER Certification</li>
      </ol>

      <h3>📈 แนวทางการลดที่ทำได้จริง</h3>
      <table>
        <tr><th>มาตรการ</th><th>ลดได้ (tCO₂e)</th><th>ระยะเวลาคืนทุน</th></tr>
        <tr><td>Solar Roof 10 kWp</td><td>~7 tCO₂e/ปี</td><td>6-8 ปี</td></tr>
        <tr><td>เปลี่ยนรถ EV 1 คัน</td><td>~3 tCO₂e/ปี</td><td>5-7 ปี (รวมค่าเชื้อเพลิง)</td></tr>
        <tr><td>LED ทุกจุด</td><td>~5 tCO₂e/ปี</td><td>1-2 ปี</td></tr>
        <tr><td>ลดขยะอาหาร 50%</td><td>~1 tCO₂e/ปี</td><td>ทันที</td></tr>
        <tr><td>ใช้ชีวมวลแทน LPG</td><td>~10 tCO₂e/ปี</td><td>1-3 ปี</td></tr>
      </table>
    `,
  },
  {
    id: 'faq',
    icon: '❓',
    title: 'FAQ คำถามที่พบบ่อย',
    tag: 'All',
    tagColor: '#6b7280',
    summary: 'รวมคำถามที่พบบ่อยเกี่ยวกับ CFO การขอรับรอง และการใช้งานระบบ',
    content: `
      <h3>คำถามเกี่ยวกับ CFO</h3>
      <div class="faq-item">
        <p><b>❓ CFO ต้องทำทุกปีไหม?</b></p>
        <p>แนะนำให้ทำทุกปีเพื่อติดตามแนวโน้ม แต่การขอรับรอง อบก. อาจทำทุก 2-3 ปี</p>
      </div>
      <div class="faq-item">
        <p><b>❓ ค่าใช้จ่ายในการขอรับรองเท่าไหร่?</b></p>
        <p>ขึ้นอยู่กับขนาดองค์กร — เริ่มต้น ~50,000-200,000 บาท (รวมค่าทวนสอบ)</p>
      </div>
      <div class="faq-item">
        <p><b>❓ ใช้เวลานานแค่ไหน?</b></p>
        <p>เก็บข้อมูล 1-2 เดือน + คำนวณ 1-2 สัปดาห์ + ทวนสอบ 1 เดือน = รวม ~3-4 เดือน</p>
      </div>
      <div class="faq-item">
        <p><b>❓ ข้อมูลต้องละเอียดแค่ไหน?</b></p>
        <p>ต้องมี Activity Data (ใบเสร็จ, บิล, Logbook) พร้อม Source Reference — ระบบของเรารองรับการบันทึกที่มาของข้อมูล</p>
      </div>
      <div class="faq-item">
        <p><b>❓ ถ้าข้อมูลไม่ครบจะทำอย่างไร?</b></p>
        <p>ใช้ค่าประมาณการตามหลักวิชาการ พร้อมบันทึกสมมติฐานใน Assumption Log — ผู้ทวนสอบจะพิจารณาเป็นกรณี</p>
      </div>

      <h3>คำถามเกี่ยวกับระบบ</h3>
      <div class="faq-item">
        <p><b>❓ ข้อมูลของเราปลอดภัยไหม?</b></p>
        <p>ข้อมูลถูกเก็บใน Firebase/Firestore ของ Google Cloud — มีการยืนยันตัวตนผ่าน Firebase Auth + OTP มี Audit Trail ทุกการเปลี่ยนแปลง</p>
      </div>
      <div class="faq-item">
        <p><b>❓ Export ออกมาเป็นอะไรได้บ้าง?</b></p>
        <p>CSV (ตาราง), Excel (.xlsx 7 Sheets ตาม Template อบก.) — พร้อมยื่นขอรับรองได้ทันที</p>
      </div>
    `,
  },
];

export const TOOLTIPS = {
  stationary: 'การเผาไหม้เชื้อเพลิงที่อยู่กับที่ เช่น เครื่องกำเนิดไฟฟ้า หม้อต้มน้ำ เตาในกระบวนการผลิต — องค์กรควบคุมการใช้งานโดยตรง จัดเป็น Scope 1',
  mobile: 'ยานพาหนะที่องค์กรเป็นเจ้าของหรือเช่าใช้ เช่น รถกระบะ รถบรรทุก 6 ล้อ รถจักรยานยนต์ — กรอกระยะทางหรือปริมาณน้ำมันที่ใช้',
  fugitive: 'การรั่วไหลของสารทำความเย็นจากเครื่องปรับอากาศ ระบบทำความเย็น — แม้ปริมาณน้อย แต่มี GWP สูงมาก (เช่น R-410A = 2,088 เท่าของ CO₂)',
  electricity: 'ไฟฟ้าที่ซื้อจากการไฟฟ้า (MEA/PEA) — ถึงแม้องค์กรไม่ได้ผลิตเอง แต่การใช้ไฟฟ้าทำให้เกิด CO₂ ที่โรงไฟฟ้า จัดเป็น Scope 2',
  waste_landfill: 'ขยะที่นำไปฝังกลบ — เมื่อย่อยสลายแบบไร้อากาศ เกิดก๊าซมีเทน (CH₄) ซึ่งมี GWP = 28 เท่าของ CO₂',
  waste_recycle: 'ขยะที่นำไปรีไซเคิล — ไม่นับเป็น Greenhouse Gas Emission (EF = 0) สนับสนุน Circular Economy',
  organic: 'ขยะอินทรีย์นำไปทำปุ๋ย — ไม่นับเป็น Emission (EF = 0) ช่วยลดขยะฝังกลบ',
  wastewater: 'น้ำเสียจากกิจกรรมขององค์กร — การบำบัดแบบไม่ใช้ออกซิเจน (Anaerobic) เกิดก๊าซมีเทน',
  biogenic: 'ก๊าซ CO₂ ที่เกิดจากการเผาไหม้ชีวมวล (เศษไม้ แกลบ ก๊าซชีวภาพ) — ถือเป็น Net Zero CO₂ เนื่องจากพืชดูดซับ CO₂ มาตอนเติบโต อบก. กำหนดให้แยกรายงานออกจาก Scope 1',
  baseYear: 'ปีที่ใช้เป็นฐานในการเปรียบเทียบ — ปกติคือปีแรกที่เริ่มเก็บข้อมูล CFO ขององค์กร ใช้วัดความก้าวหน้าการลด Carbon',
  carbonOffset: 'การซื้อ Carbon Credit เพื่อชดเชยส่วนที่ยังลดไม่ได้ — ต้องเป็นเครดิตที่ผ่านการรับรอง (T-VER) เท่านั้น',
  carbonIntensity: 'ปริมาณ Carbon ต่อมูลค่าทางเศรษฐกิจ — tCO₂e ต่อล้านบาทของรายได้ ยิ่งต่ำแสดงถึงประสิทธิภาพการใช้ทรัพยากรที่ดี',
  gridArea: 'พื้นที่ให้บริการไฟฟ้า — MEA = การไฟฟ้านครหลวง (กรุงเทพฯ), PEA = การไฟฟ้าส่วนภูมิภาค (ต่างจังหวัด)',
  sourceReference: 'แหล่งที่มาของข้อมูล เช่น เลขที่บิล เลขที่ใบส่งของ ชื่อเอกสาร — ใช้เป็นหลักฐานสำหรับผู้ทวนสอบ',
};

export const KPI_DEFINITIONS = [
  {
    id: 'total',
    label: 'Total Carbon Footprint',
    icon: '📊',
    formula: 'Scope 1 + Scope 2 + Scope 3',
    meaning: 'ปริมาณก๊าซเรือนกระจกรวมที่องค์กรปล่อยใน 1 ปี — ตัวชี้วัดหลัก',
    benchmark: 'ค่าเฉลี่ยองค์กรขนาดเล็ก: 50-200 tCO₂e/ปี',
    target: 'ลดลงทุกปี → Net Zero 2593',
    howToImprove: [
      'ติดตั้ง Solar Roof',
      'เปลี่ยนรถเป็น EV',
      'เปลี่ยน LED',
      'เพิ่ม Recycling',
      'ใช้ชีวมวล',
    ],
    environmentalImpact: 'การลด 1 tCO₂e = ปลูกต้นไม้ 50 ต้น/ปี',
  },
  {
    id: 'intensity',
    label: 'Carbon Intensity',
    icon: '📉',
    formula: 'Total tCO₂e ÷ รายได้ (ล้านบาท)',
    meaning: 'ประสิทธิภาพการใช้คาร์บอนต่อมูลค่าทางเศรษฐกิจ',
    benchmark: 'ยิ่งต่ำ ยิ่งมีประสิทธิภาพ',
    target: 'ลด 5% ต่อปี',
    howToImprove: [
      'เพิ่มประสิทธิภาพการใช้พลังงาน',
      'ใช้พลังงานสะอาด',
      'เพิ่มมูลค่าผลิตภัณฑ์',
    ],
    environmentalImpact: 'สะท้อนการแยกการเติบโตทางเศรษฐกิจจากการปล่อย Carbon (Decoupling)',
  },
  {
    id: 'reduction',
    label: '% ลดจากปีฐาน',
    icon: '🎯',
    formula: '((Base - Current) ÷ Base) × 100%',
    meaning: 'วัดความก้าวหน้าเทียบกับปีฐาน (Default: 2561)',
    benchmark: '',
    target: 'ลด 50% → 2573, Net Zero → 2593',
    howToImprove: [
      'ดูแนวโน้มรายเดือน',
      'วิเคราะห์จุดที่ลดได้',
      'วางแผนระยะยาว',
    ],
    environmentalImpact: 'แสดงถึงความมุ่งมั่นขององค์กรในการลด Climate Impact',
  },
  {
    id: 'credit',
    label: 'Carbon Credit',
    icon: '💱',
    formula: 'ปริมาณที่ลด (tCO₂e) × ราคาตลาด',
    meaning: 'มูลค่าที่ได้จากการลดก๊าซเรือนกระจก — สามารถซื้อขายได้',
    benchmark: 'ราคาตลาด FTIX ~2,000-3,000 บาท/tCO₂e',
    target: 'ขายเครดิตเมื่อลดเกินเป้า',
    howToImprove: [
      'ลดให้มากกว่าเป้าหมาย',
      'ขอรับรอง T-VER',
      'ขายผ่าน FTIX',
    ],
    environmentalImpact: 'สร้างแรงจูงใจทางเศรษฐกิจในการลด Carbon',
  },
];

export const BENEFICIARY_STATEMENT = {
  executive: {
    icon: '👥',
    title: 'ผู้บริหาร',
    points: [
      'ข้อมูลตัดสินใจเชิงกลยุทธ์ — เห็นแนวโน้ม วางแผนลด คำนวณ ROI',
      'ลดความเสี่ยงด้านกฎระเบียบในอนาคต (CBAM, CSRD)',
      'เพิ่มมูลค่าองค์กรด้วย Green Value',
      'รองรับข้อกำหนด ESG จากนักลงทุน',
    ],
  },
  customer: {
    icon: '🤝',
    title: 'ลูกค้า/คู่ค้า',
    points: [
      'ผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม — ตรวจสอบ Carbon Footprint ได้',
      'สร้างความเชื่อมั่นด้วยมาตรฐาน อบก.',
      'รองรับข้อกำหนด CBAM ของสหภาพยุโรป',
      'ตอบโจทย์ผู้บริโภคยุคใหม่ที่ใส่ใจสิ่งแวดล้อม',
    ],
  },
  employee: {
    icon: '👨‍👩‍👧‍👧',
    title: 'พนักงาน',
    points: [
      'ภาคภูมิใจในองค์กรที่ใส่ใจสิ่งแวดล้อม',
      'มีส่วนร่วมในการลด Carbon ผ่านกิจกรรม Green',
      'สภาพแวดล้อมการทำงานที่ยั่งยืน',
      'พัฒนาทักษะด้าน Sustainability',
    ],
  },
  society: {
    icon: '🌏',
    title: 'สังคม/สิ่งแวดล้อม',
    points: [
      'ลดผลกระทบต่อ Climate Change อย่างเป็นรูปธรรม',
      'สนับสนุนเป้าหมาย Thailand Net Zero 2050',
      'เป็นต้นแบบองค์กรยั่งยืนในอุตสาหกรรม',
      'สร้างระบบนิเวศทางธุรกิจที่ยั่งยืน',
    ],
  },
};

export const CERTIFICATION_BADGES = [
  { name: 'อบก. (TGO)', icon: '🏛️', desc: 'องค์การบริหารจัดการก๊าซเรือนกระจก' },
  { name: 'GHG Protocol', icon: '📋', desc: 'มาตรฐานการรายงาน GHG สากล' },
  { name: 'IPCC AR5', icon: '🔬', desc: 'Emission Factors ตาม IPCC' },
  { name: 'ISO 14064', icon: '✅', desc: 'มาตรฐานการวัด GHG ระดับองค์กร' },
];

export default {
  KNOWLEDGE_MODULES,
  TOOLTIPS,
  KPI_DEFINITIONS,
  BENEFICIARY_STATEMENT,
  CERTIFICATION_BADGES,
};