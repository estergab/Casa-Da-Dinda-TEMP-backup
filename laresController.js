const Lar = require('../models/Lar');
const path = require('path');
const fs = require('fs');

// Função auxiliar para processar availableFor
const parseAvailableFor = (availableFor) => {
  if (!availableFor) return [];
  if (Array.isArray(availableFor)) return availableFor;
  if (typeof availableFor === 'string') {
    try {
      // Tentar parsear JSON primeiro
      return JSON.parse(availableFor);
    } catch {
      // Se não for JSON, separar por vírgulas
      return availableFor.split(',').map(item => item.trim());
    }
  }
  return [];
};

// Criar lar
exports.createLar = async (req, res, next) => {
  try {
    console.log("📥 BODY recebido:", req.body);
    console.log("📸 FILE recebido:", req.file);

    const { availableFor, ...data } = req.body;
    const imageUrl = req.file ? `/uploads/lares/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Imagem é obrigatória' 
      });
    }

    const lar = new Lar({
      ...data,
      availableFor: parseAvailableFor(availableFor),
      imageUrl
    });

    await lar.save();
    res.status(201).json({ success: true, data: lar });
  } catch (error) {
    console.error("❌ ERRO NO createLar:", error);
    next(error);
  }
};

// Listar lares
exports.getLares = async (req, res, next) => {
  try {
    const lares = await Lar.find().sort({ createdAt: -1 });
    res.json({ success: true, data: lares });
  } catch (error) {
    next(error);
  }
};

// Buscar lar por ID
exports.getLarById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log("🔍 Buscando lar com ID:", id);
    
    // ✅ USAR findById EM VEZ DE findOne({ id: ... })
    const lar = await Lar.findById(id);
    
    if (!lar) {
      console.log("❌ Lar não encontrado");
      return res.status(404).json({ 
        success: false, 
        message: 'Lar não encontrado' 
      });
    }
    
    console.log("✅ Lar encontrado:", lar);
    res.json({ success: true, data: lar });
  } catch (error) {
    console.error("❌ Erro ao buscar lar:", error);
    
    // Se o ID for inválido, retorna 400
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }
    
    next(error);
  }
};

// Atualizar lar
exports.updateLar = async (req, res, next) => {
  try {
    const { availableFor, ...data } = req.body;
    const updateData = { ...data };

    if (availableFor) {
      updateData.availableFor = parseAvailableFor(availableFor);
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/lares/${req.file.filename}`;
      
      // Remover imagem antiga
      const oldLar = await Lar.findById(req.params.id);
      if (oldLar && oldLar.imageUrl) {
        const oldPath = path.join(__dirname, '../../', oldLar.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // ✅ USAR findByIdAndUpdate
    const lar = await Lar.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!lar) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lar não encontrado' 
      });
    }

    res.json({ success: true, data: lar });
  } catch (error) {
    next(error);
  }
};

// Deletar lar
exports.deleteLar = async (req, res, next) => {
  try {
    // ✅ USAR findByIdAndDelete
    const lar = await Lar.findByIdAndDelete(req.params.id);

    if (!lar) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lar não encontrado' 
      });
    }

    // Remover imagem
    if (lar.imageUrl) {
      const imagePath = path.join(__dirname, '../../', lar.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ 
      success: true, 
      message: 'Lar removido com sucesso' 
    });
  } catch (error) {
    next(error);
  }
};
