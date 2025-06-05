import mongoose from 'mongoose';
import User from '../models/user.js';
import Poem from '../models/poem.js';
import fs from 'fs';

const generateERD = () => {
  const erd = {
    version: '1.0',
    entities: []
  };

  // User 모델 ERD 변환
  const userSchema = User.schema.obj;
  const userEntity = {
    name: 'User',
    attributes: []
  };

  Object.entries(userSchema).forEach(([key, value]) => {
    const attribute = {
      name: key,
      type: value.type ? value.type.name : 'Mixed',
      required: value.required || false,
      unique: value.unique || false,
      default: value.default !== undefined ? value.default : null
    };
    userEntity.attributes.push(attribute);
  });

  // Poem 모델 ERD 변환
  const poemSchema = Poem.schema.obj;
  const poemEntity = {
    name: 'Poem',
    attributes: []
  };

  Object.entries(poemSchema).forEach(([key, value]) => {
    const attribute = {
      name: key,
      type: value.type ? value.type.name : 'Mixed',
      required: value.required || false,
      unique: value.unique || false,
      default: value.default !== undefined ? value.default : null
    };
    poemEntity.attributes.push(attribute);
  });

  erd.entities.push(userEntity, poemEntity);

  // ERD 파일 저장
  const erdJson = JSON.stringify(erd, null, 2);
  fs.writeFileSync('schema.erd.json', erdJson);
  console.log('ERD 파일이 성공적으로 생성되었습니다: schema.erd.json');
};

generateERD(); 