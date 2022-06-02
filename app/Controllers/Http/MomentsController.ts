import { v4 as uuidv4 } from 'uuid';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'App/Models/Moment'

export default class MomentsController {

    private validationOptions = {
        type: ["image"],
        size: '2mb'
    }
    //Create
    public async store({ request, response }: HttpContextContract) {

        const body = request.body();
        const moment = await Moment.create(body);
        const image = request.file('image', this.validationOptions);

        if (image) {
            const imageName = `${uuidv4()}.${image.extname}`;

            await image.move(Application.tmpPath('uploads'), {
                name: imageName
            });

            body.image = imageName;
        }

        response.status(201).json({
            message: "momento criado com sucesso",
            data: moment
        })

    }

    //Read (Pegar todos os momentos)

    public async index({ request, response }: HttpContextContract) {
        const moments = await Moment.all();
        return response.status(200).json({
            moments
        })
    }

    //Mostrar através de um id

    public async show({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id);

        return {
            data: moment
        }
    }

    //Deletar

    public async destroy({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id);
        moment.delete();

        return {
            delete: true
        }
    }
    //Atualizar
    public async update({ params, request }: HttpContextContract) {
        const body = request.body();
        const moment = await Moment.findOrFail(params.id);
        moment.title = body.title
        moment.description = moment.description

        if (moment.image != body.image || !moment.image) {
            const image = request.file('image', this.validationOptions);
            if (image) {
                const imageName = `${uuidv4()}.${image.extname}`;

                await image.move(Application.tmpPath('uploads'), {
                    name: imageName
                });
                 moment.image = imageName

            }

        }
        await moment.save();
        return {
            message: "Momento atualizado com sucesso",
            data: moment,
        }
    }
}
