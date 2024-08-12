import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DataSource, Repository } from 'typeorm';
import { Administrador } from './entities/administrador.entity';
import * as Bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { MakeAdminDto } from './dto/make-admin.dto';

@Injectable()
export class UsuarioService {

  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Administrador) private adminRepository: Repository<Administrador>,
    private dataSource: DataSource
  ) { }

  /**
   * Crea un nuevo usuario y lo define como administrador en caso de ser necesario
   * @param createUsuarioDto Objeto que contiene los datos del usuario a registrar
   * @returns Promesa con la información del nuevo Usuario creado
   * @throws ConflictException en caso de que no sea posible registrar al usuario
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    const queryRunner = this.dataSource.createQueryRunner()

    // Encryptando la contraseña
    let { isAdmin, password, ...newUsuario } = createUsuarioDto;
    password = Bcrypt.hashSync(password, 10);

    // Preprarando el objeto para ser insertado
    let usuario: Usuario = {
      password,
      ...newUsuario
    }

    // Preparando la trnsacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Insertando al nuevo Usuario
      const result = await queryRunner.manager.insert<Usuario>(Usuario, usuario);
      usuario.idUsuario = result.identifiers[0].idUsuario as number;

      console.log(result.identifiers[0].idUsuario as number, usuario);

      // Si el nuevo usuario es un Admin, entonces lo almacena también como tal
      if (isAdmin) {
        const { idUsuario } = usuario;
        let admin: Administrador = { idUsuario };

        // Creando el nuevo registro de administrador
        await queryRunner.manager.insert<Administrador>(Administrador, admin);
      }

      // Guardando los cambios en la base de datos
      await queryRunner.commitTransaction();
    } catch (error) {
      // Revirtiendo los cambios para evitar incoengruensias en la base de datos
      await queryRunner.rollbackTransaction();
      // Eliminando la instancia del queryRunner
      await queryRunner.release();

      const { sqlMessage } = error;
      throw new ConflictException(sqlMessage ?? 'No fue posible guardar al usuario');
    } finally {
      // Eliminando la instancia del queryRunner
      await queryRunner.release();
    }

    // Si todo sale bien se retorna el valor del nuevo usuario;
    let { password: _, ...user } = usuario;
    return { ...user, isAdmin };
  }

  /**
   * Extrae toda lalista de usuarios de la base de datos y la retorna
   * @returns Promesa con la lista de todos los ususario
   */
  findAll() {
    return this.usuarioRepository.find();
  }

  /**
   * Busca un Usuario por su ID dentro de la base de datos
   * @param idUsuario ID del Usuario al cual va a buscar
   * @returns Promesa con la información del Usuario, incluyendo una bandera que indica si el Usuario es administrador
   * @throws NotFoundException en caso de no encontrar un usuario con el ID ingresado
   */
  async findOne(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario });

    if (!usuario) {
      throw new NotFoundException(`No se encontró Usuario alguno con el ID ${idUsuario}`);
    }

    const admin = this.adminRepository.findOneBy({idUsuario});

    return {...usuario, isAdmin: Boolean(admin)};
  }

  /**
   * Realiza la operación de búsqueda de usuario por el email y la contraseña
   * @param loginData Información del usuario que intentat logearse
   * @returns Promesa con la información del usuario
   */
  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    const usuario = await this.usuarioRepository.findOneBy({ email })

    if (!usuario) {
      throw new NotFoundException(`No existe registro del email ${email}`);
    }

    if (!Bcrypt.compareSync(password, usuario.password)) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }

    // Revisando si el usuario es Administrador
    const admin = await this.adminRepository.findOneBy({idUsuario: usuario.idUsuario});
    delete usuario.password;

    return {...usuario, isAdmin: Boolean(admin)};
  }

  /**
   * Actualiza la información del usuario en la Base de datos
   * @param idUsuario ID del usuario al cual se le actualizarán los datos
   * @param updateUsuarioDto Objeto con la información del usuario a almacenar
   * @returns Promesa con la nueva infomación del usuario
   */
  async update(idUsuario: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOneBy({idUsuario})
    
    if (!usuario){
      throw new NotFoundException(`No existe el usuario conel ID ${idUsuario}`)
    }

    if (usuario.email !== updateUsuarioDto.email) {
      throw new ForbiddenException(`No se puede cambiar el correo del usuario con este método`);
    }

    // Si se actualiza la contraseña, entonces se encripta
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = Bcrypt.hashSync(updateUsuarioDto.password, 10);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.update<Usuario>(Usuario, updateUsuarioDto, updateUsuarioDto);
      console.log(result);
      
      await queryRunner.commitTransaction();
    } catch (error) {
      // console.log(error);
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      
      const { sqlMessage } = error;
      throw new ConflictException(sqlMessage ?? `No fue posible actualizar al usuario con email ${usuario.email}`);
    } finally {
      await queryRunner.release();
    }
    return updateUsuarioDto;
  }

  /**
   * Método para hacer a un usuario administrador
   * @param adminDto 
   * @returns 
   */
  async makeAdmin(adminDto: MakeAdminDto) {
    const { requester: idAdmin, newAdmin: idUsuario } = adminDto;
    let admin = await this.adminRepository.findOneBy({idUsuario: idAdmin});

    if (!admin) {
      throw new UnauthorizedException(`Debe tener derechos de administrador para hacer un usuario administrador`);
    }
    
    const usuario = await this.usuarioRepository.findOneBy({idUsuario});
    if (!usuario){
      throw new NotFoundException(`El usuario con el ID ${idUsuario} no existe en la base de datos`);
    }

    admin = await this.adminRepository.findOneBy({idUsuario});

    if (admin) {
      throw new ConflictException(`El usuario con el ID ${idUsuario} ya es administrador`);
    }
    
    try {
      await this.adminRepository.insert({idUsuario});
    } catch (error) {
      const { sqlMessage } = error;
      throw new ConflictException(sqlMessage ?? `No fue possible hacer que el usuario con el ID ${idUsuario} sea administrador`)
    }
    
    delete usuario.password;
    return {...usuario, isAdmin: true};
  }

  /**
   * Método que permite eliminar Usuarios de la base de Datos
   * @param idUsuario ID del usaurio a eliminar
   * @returns Promesa con el Usuario eliminado
   */
  async remove(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOneBy({idUsuario});
    const admin   = await this.adminRepository.findOneBy({idUsuario});

    if (!usuario) {
      throw new NotFoundException('El usuario no existe o ya fue eliminado');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (admin) {
        await queryRunner.manager.delete<Administrador>(Administrador, admin);
      }
      
      await queryRunner.manager.delete<Usuario>(Usuario, usuario);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      const { sqlMessage } = error;
      throw new ConflictException(sqlMessage ?? `No fue posible eliminar al usuario ${usuario.email}`);
    } finally {
      queryRunner.release();
    }
    
    return {...usuario, isAdmin: Boolean(admin)};
  }
}
